// @flow
import React, { Component } from 'react';
import { KeyboardAvoidingView } from 'react-native';

export default class PlatformWindow extends Component {
  props: {
    children: Array<React.Element<*>> | React.Element<*>
  };

  render() {
    return (
      <KeyboardAvoidingView behavior={'position'}>
        { this.props.children }
      </KeyboardAvoidingView>
    );
  }
}