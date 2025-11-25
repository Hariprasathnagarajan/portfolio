import { SvgIcon } from "@mui/material";

const DoubleChatIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    {/* Back bubble */}
    <path
      d="M3 4h13c0.6 0 1 .4 1 1v8c0 .6-.4 1-1 1H6l-3 3V5c0-.6.4-1 1-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"

      
    />
    {/* Front bubble */}
    <path
      d="M8 9h13c0.6 0 1 .4 1 1v8c0 .6-.4 1-1 1h-10l-3 3v-11c0-.6.4-1 1-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </SvgIcon>
);

export default DoubleChatIcon;
