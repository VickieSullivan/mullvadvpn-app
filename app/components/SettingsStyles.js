import { createViewStyles, createTextStyles } from '../lib/styles';
import { colors } from '../config';

export default Object.assign(createViewStyles({
  settings: {
    backgroundColor: colors.darkBlue,
    height: '100%'
  },
  settings__container:{
    flexDirection: 'column',
    flex: 1
  },
  settings__header:{
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    paddingTop: 16,
    paddingRight: 24,
    paddingLeft: 24,
    paddingBottom: 16,
  },
  settings__content: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
  },
  settings__scrollview: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '100%',
  },
  settings__close: {
    marginLeft: 12,
    marginTop: 24,
    cursor: 'default',
  },
  settings__close_icon:{
    width: 24,
    height: 24,
    flex: 0,
    opacity: 0.6,
  },
  settings__cell_spacer:{
    height: 24,
    flex: 0
  },
  settings__footer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
}), createTextStyles({
  settings__title:{
    fontFamily: 'DINPro',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
    color: colors.white
  },
  settings__account_paid_until_label__error:{
    color: colors.red,
  },
}));
