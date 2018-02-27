// @flow
import { createViewStyles, createTextStyles } from '../lib/styles';
import { colors } from '../config';

export default {
  ...createViewStyles({
    login: {
      height: '100%',
    },
    login_footer: {
      backgroundColor: colors.darkBlue,
      paddingTop: 18,
      paddingBottom:24,
      flex: 0,
    },
    status_icon: {
      flex: 0,
      height: 48,
      marginBottom: 30,
      justifyContent: 'center',
    },
    login_form:{
      flex:1,
      flexDirection: 'column',
      justifyContent: 'flex_end',
      overflow:'visible',
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 24,
      paddingRight: 24,
      marginTop: 83,
      marginBottom:0,
      marginRight: 0,
      marginLeft:0,
    },
    account_input_group: {
      borderWidth: 2,
      borderRadius: 8,
      borderColor: 'transparent',
    },
    account_input_group__active: {
      borderColor: colors.darkBlue,
    },
    account_input_group__inactive: {
      opacity: 0.6,
    },
    account_input_group__error: {
      borderColor: colors.red40,
      color: colors.red,
    },
    account_input_textfield: {
      color: colors.blue,
    },
    account_input_backdrop: {
      backgroundColor: colors.white,
      borderColor: colors.darkBlue,
      flexDirection: 'row',
    },
    account_input_textfield__inactive: {
      backgroundColor: colors.white60,
    },
    account_input_button: {
      flex: 0,
      border: 0,
      width: 48,
      alignItems: 'center',
      color: colors.blue20,
    },
    account_input_button__active: {
      color: colors.white,
      backgroundColor: colors.green,
    },
    account_input_button__invisible: {
      visibility: 'hidden',
      opacity: 0,
    },
    account_dropdown__spacer: {
      height: 1,
      backgroundColor: colors.darkBlue,
    },
    account_dropdown__item: {
      flexDirection: 'row',
      backgroundColor: colors.white60,
      borderColor: colors.darkBlue,
    },
    account_dropdown__remove: {
      paddingTop: 10,
      paddingLeft: 12,
      paddingRight: 12,
      paddingBottom: 12,
      /* center SVG within button */
      justifyContent: 'center',
    },
  }),
  ...createTextStyles({
    login_footer__prompt: {
      color: colors.white80,
      fontFamily: 'Open Sans',
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
      letterSpacing: -0.2,
      marginLeft: 24,
      marginRight: 24,
    },
    title: {
      fontFamily: 'DINPro',
      fontSize: 32,
      fontWeight: '900',
      lineHeight: 44,
      letterSpacing: -0.7,
      color: colors.white,
      marginBottom: 7,
      flex:0,
    },
    subtitle: {
      fontFamily: 'Open Sans',
      fontSize: 13,
      fontWeight: '600',

      letterSpaceing: -0.2,
      color: colors.white80,
      marginBottom: 8,
    },
    account_input_textfield: {
      border: 0,
      paddingTop: 10,
      paddingRight: 12,
      paddingLeft: 12,
      paddingBottom: 12,
      fontFamily: 'DINPro',
      fontSize: 20,
      fontWeight: 900,
      lineHeight: 26,
      color: colors.blue,
      backgroundColor: 'transparent',
      flex: 1,
    },
    account_dropdown__label: {
      flex: 1,
      fontFamily: 'DINPro',
      fontSize: 20,
      fontWeight: '900',
      lineHeight: 26,
      color: colors.blue,
      border: 0,
      paddingTop: 10,
      paddingLeft: 12,
      paddingRight: 12,
      paddingBottom: 12,
      textAlign: 'left',
    },
  })
};
