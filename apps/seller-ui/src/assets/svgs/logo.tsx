import * as React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="#ffffff"
    height="24"
    width="24"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M186.2,139.6h139.6V0H186.2V139.6z M372.4,0v139.6H512V0H372.4z M0,139.6h139.6V0H0V139.6z M186.2,325.8h139.6V186.2H186.2V325.8z M372.4,325.8H512V186.2H372.4V325.8z M0,325.8h139.6V186.2H0V325.8z M186.2,512h139.6V372.4H186.2V512z M372.4,512H512V372.4H372.4V512z M0,512h139.6V372.4H0V512z" />
  </svg>
);

export default Logo;
