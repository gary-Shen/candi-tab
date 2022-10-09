export interface ThemeTypes {
  primaryColor: string;
  infoColor: string;
  warningColor: string;
  dangerColor: string;
  lightColor: string;
  darkColor: string;
  // ======
  bodyBackground: string;
  bodyBackgroundImage: string;
  fontSize: string;
  borderColor: string;
  secondaryColor: string;
  borderRadius: string;
  boxShadow: string;
  // ======
  grayColor: string;
  grayColorHover: string;
  fontColor: string;
  card: {
    paddingX: string;
    paddingY: string;
    headerBackground: string;
    bodyBackground: string;
  };

  modal: {
    headerBackground: string;
    bodyBackground: string;
  };

  menu: {
    activeBackgroundColor: string;
    activeColor: string;
  };

  form: {
    insetColor: string;
  };

  button: {
    paddingX: string;
    paddingY: string;
  };
}
