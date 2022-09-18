export interface Theme {
  backgroundColor: string;
  backgroundImage: string;
  fontSize: string;
  fontFamily: string;
  color: string;

  primary: string;
  danger: string;
  info: string;
  warning: string;
  success: string;

  block: {
    padding: string;
    margin: string;
    borderRadius: string;
  };

  link: Record<string, string>;

  modal: Record<string, string>;
}
