// @flow
import * as React from 'react';
import { formatAccount } from '../lib/formatters';

// @TODO: move it into types.js

// ESLint issue: https://github.com/babel/babel-eslint/issues/445
declare class ClipboardData { // eslint-disable-line no-unused-vars
  setData(type: string, data: string): void;
  getData(type: string): string;
}

declare class ClipboardEvent extends Event {
  clipboardData: ClipboardData;
}

export type AccountInputProps = {
  value: string;
  onEnter: ?(() => void);
  onChange: ?((newValue: string) => void);
};

type AccountInputState = {
  value: string;
  selectionRange: SelectionRange;
};

type SelectionRange = [number, number];

export default class AccountInput extends React.Component<AccountInputProps, AccountInputState> {
  static defaultProps = {
    value: '',
    onEnter: null,
    onChange: null
  };

  state = {
    value: '',
    selectionRange: [0, 0]
  };

  _ref: ?HTMLInputElement;
  _ignoreSelect = false;

  constructor(props: AccountInputProps) {
    super(props);

    // selection range holds selection converted from DOM selection range to
    // internal unformatted representation of account number
    const val = this.sanitize(props.value);

    this.state = {
      value: val,
      selectionRange: [val.length, val.length]
    };
  }

  componentWillReceiveProps(nextProps: AccountInputProps) {
    const nextVal = this.sanitize(nextProps.value);
    if(nextVal !== this.state.value) {
      const len = nextVal.length;
      this.setState({ value: nextVal, selectionRange: [len, len] });
    }
  }

  shouldComponentUpdate(nextProps: AccountInputProps, nextState: AccountInputState) {
    return (this.props.value !== nextProps.value ||
            this.props.onEnter !== nextProps.onEnter ||
            this.props.onChange !== nextProps.onChange ||
            this.state.value !== nextState.value ||
            this.state.selectionRange[0] !== nextState.selectionRange[0] ||
            this.state.selectionRange[1] !== nextState.selectionRange[1]);
  }

  render() {
    const displayString = formatAccount(this.state.value || '');
    const { value, onChange, onEnter, ...otherProps } = this.props; // eslint-disable-line no-unused-vars
    return (
      <input { ...otherProps }
        type="text"
        value={ displayString }
        onChange={ () => {} }
        onSelect={ this.onSelect }
        onKeyUp={ this.onKeyUp }
        onKeyDown={ this.onKeyDown }
        onPaste={ this.onPaste }
        onCut={ this.onCut }
        ref={ (ref) => this.onRef(ref) } />
    );
  }

  // Private

  /**
   * Modify original string inserting substring using selection range
   */
  sanitize(val: ?string): string {
    return (val || '').replace(/[^0-9]/g, '');
  }

  /**
   * Modify original string inserting substring using selection range
   *
   * @private
   * @param {String} val       original string
   * @param {String} insert    insertion string
   * @param {Array}  selRange  selection range ([x,y])
   * @returns {Object}
   */
  insert(val: string, insert: string, selRange: SelectionRange): AccountInputState {
    const head = val.slice(0, selRange[0]);
    const tail = val.slice(selRange[1], val.length);
    const newVal = head + insert + tail;
    const selectionOffset = head.length + insert.length;

    return { value: newVal, selectionRange: [selectionOffset, selectionOffset] };
  }


  /**
   * Modify string by removing single character or range of characters based on selection range.
   *
   * @private
   * @param {String} val       original string
   * @param {Array}  selRange  selection range ([x,y])
   * @returns {Object}
   *
   * @memberOf AccountInput
   */
  remove(val: string, selRange: SelectionRange): AccountInputState {
    let newVal, selectionOffset;

    if(selRange[0] === selRange[1]) {
      const oneOff = Math.max(0, selRange[0] - 1);
      const head = val.slice(0, oneOff);
      const tail = val.slice(selRange[0], val.length);
      newVal = head + tail;
      selectionOffset = head.length;
    } else {
      const head = val.slice(0, selRange[0]);
      const tail = val.slice(selRange[1], val.length);
      newVal = head + tail;
      selectionOffset = head.length;
    }

    return { value: newVal, selectionRange: [selectionOffset, selectionOffset] };
  }


  /**
   * Convert DOM selection range to internal selection range
   *
   * @private
   * @param {String} val      original string
   * @param {Array} domRange  selection range from DOM
   * @returns {Object}
   *
   * @memberOf AccountInput
   */
  toInternalSelectionRange(val: string, domRange: SelectionRange): SelectionRange {
    const countSpaces = (val) => {
      return (val.match(/\s/g) || []).length;
    };

    const fmt = formatAccount(val || '');
    let start = domRange[0];
    let end = domRange[1];
    const before = countSpaces(fmt.slice(0, start));
    const within = countSpaces(fmt.slice(start, end));

    start -= before;
    end -= (before + within);

    return [ start, end ];
  }


  /**
   * Convert internal selection range to DOM selection range
   *
   * @private
   * @param {String} val       original string
   * @param {Array}  selRange  selection range
   * @returns {Object}
   *
   * @memberOf AccountInput
   */
  toDomSelection(val: string, selRange: SelectionRange): SelectionRange {
    const countSpaces = (val, untilIndex) => {
      if(val.length > 12) { return 0; }
      return Math.floor(untilIndex / 4); // groups of 4 digits
    };

    let start = selRange[0];
    let end = selRange[1];
    const startSpaces = countSpaces(val, start);
    const endSpaces = countSpaces(val, end);

    start += startSpaces;
    end += startSpaces + (endSpaces - startSpaces);

    return [ start, end ];
  }

  // Events

  onKeyDown = (e: KeyboardEvent) => {
    const { value, selectionRange } = this.state;

    if(e.which === 8) { // backspace
      const result = this.remove(value, selectionRange);
      e.preventDefault();

      this._ignoreSelect = true;

      this.setState(result, () => {
        if(this.props.onChange) {
          this.props.onChange(result.value);
        }
      });
    } else if(/^[0-9]$/.test(e.key)) { // digits or cmd+v
      const result = this.insert(value, e.key, selectionRange);
      e.preventDefault();

      this._ignoreSelect = true;

      this.setState(result, () => {
        if(this.props.onChange) {
          this.props.onChange(result.value);
        }
      });
    }
  }

  onKeyUp = (e: KeyboardEvent) => {
    this._ignoreSelect = false;

    if(e.which === 13 && this.props.onEnter) {
      this.props.onEnter();
    }
  }

  onSelect = (e: Event) => {
    const ref = e.target;
    if(!(ref instanceof HTMLInputElement)) {
      throw new Error('ref must be an instance of HTMLInputElement');
    }

    if(this._ignoreSelect) {
      return;
    }

    const start = ref.selectionStart;
    const end = ref.selectionEnd;
    const selRange = this.toInternalSelectionRange(this.sanitize(ref.value), [start, end]);
    this.setState({ selectionRange: selRange });
  }

  onPaste = (e: ClipboardEvent) => {
    const { value, selectionRange } = this.state;
    const pastedData = e.clipboardData.getData('text');
    const filteredData = this.sanitize(pastedData);
    const result = this.insert(value, filteredData, selectionRange);
    e.preventDefault();
    this.setState(result, () => {
      if(this.props.onChange) {
        this.props.onChange(result.value);
      }
    });
  }

  onCut = (e: ClipboardEvent) => {
    const target = e.target;
    if(!(target instanceof HTMLInputElement)) {
      throw new Error('ref must be an instance of HTMLInputElement');
    }

    const { value, selectionRange } = this.state;

    e.preventDefault();

    // range is not empty?
    if(selectionRange[0] !== selectionRange[1]) {
      const result = this.remove(value, selectionRange);
      const domSelectionRange = this.toDomSelection(value, selectionRange);
      const slice = target.value.slice(domSelectionRange[0], domSelectionRange[1]);

      e.clipboardData.setData('text', slice);

      this.setState(result, () => {
        if(this.props.onChange) {
          this.props.onChange(result.value);
        }
      });
    }
  }

  onRef(ref: ?HTMLInputElement) {
    this._ref = ref;
    if(!ref) { return; }

    const { value, selectionRange } = this.state;
    const domRange = this.toDomSelection(value, selectionRange);

    ref.selectionStart = domRange[0];
    ref.selectionEnd = domRange[1];
  }

  focus() {
    if(this._ref) {
      this._ref.focus();
    }
  }

}