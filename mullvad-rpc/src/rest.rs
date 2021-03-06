use futures::{future, Future, Stream};
use futures::sync::{mpsc, oneshot};

use hyper;
use hyper::{Request, StatusCode, Uri};
use hyper::client::Client;
use hyper_tls::HttpsConnector;
use native_tls;

use tokio_core::reactor::Handle;


error_chain! {
    errors {
        /// When the http status code of the response is not 200 OK
        HttpError(http_code: StatusCode) {
            description("Http error. Server did not return 200 OK")
            display("Http error. Status code {}", http_code)
        }
    }
    foreign_links {
        Tls(native_tls::Error);
        Hyper(hyper::Error) #[doc = "An error occured in Hyper."];
        Uri(hyper::error::UriError) #[doc = "The string given was not a valid URI."];
    }
}


pub type RequestSender = mpsc::UnboundedSender<(Request, oneshot::Sender<Result<Vec<u8>>>)>;
type RequestReceiver = mpsc::UnboundedReceiver<(Request, oneshot::Sender<Result<Vec<u8>>>)>;

pub fn create_http_client(handle: &Handle) -> Result<RequestSender> {
    let connector = HttpsConnector::new(1, handle)?;
    let client = Client::configure().connector(connector).build(handle);
    let (request_tx, request_rx) = mpsc::unbounded();
    handle.spawn(create_request_processing_future(request_rx, client));
    Ok(request_tx)
}

fn create_request_processing_future<CC: hyper::client::Connect>(
    request_rx: RequestReceiver,
    client: Client<CC, hyper::Body>,
) -> Box<Future<Item = (), Error = ()>> {
    let f = request_rx.for_each(move |(request, response_tx)| {
        trace!("Sending request to {}", request.uri());
        client
            .request(request)
            .from_err()
            .and_then(|response: hyper::Response| {
                if response.status() == hyper::StatusCode::Ok {
                    future::ok(response)
                } else {
                    future::err(ErrorKind::HttpError(response.status()).into())
                }
            })
            .and_then(|response: hyper::Response| response.body().concat2().from_err())
            .map(|response_chunk| response_chunk.to_vec())
            .then(move |response_result| {
                if let Err(_) = response_tx.send(response_result) {
                    warn!("Unable to send response back to caller");
                }
                Ok(())
            })
    });
    Box::new(f) as Box<Future<Item = (), Error = ()>>
}

pub fn create_get_request(uri: Uri) -> Request {
    Request::new(hyper::Method::Get, uri)
}
