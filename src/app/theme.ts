import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

export const theme = extendTheme({
  styles: {
    global: (props: any) => ({
      body: {
        minHeight: "100vh",
        bg: mode(
          "rgb(46,2,109)",
          "rgb(46,2,109);-moz-linear-gradient(180deg, rgb(46, 2, 109), rgb(21, 22, 44));-webkit-linear-gradient(180deg, rgb(46, 2, 109), rgb(21, 22, 44));linear-gradient(180deg, rgb(46, 2, 109), rgb(21, 22, 44));"
        )(props),
        filter:
          'progid:DXImageTransform.Microsoft.gradient(startColorstr="#2e026d",endColorstr="#15162c",GradientType=1);',
      },
    }),
  },
});