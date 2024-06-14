// import { ChakraProvider } from '@chakra-ui/react'
import { fonts } from './lib/fonts'
import { theme } from './theme'
import Layout from "./layout";

function MyApp({ Component, pageProps }) {
    console.warn('my app')
  return (
    <>
    {/* <style jsx global>
        {`
          :root {
            --font-quicksand: ${fonts.quicksand.style.fontFamily};
          }
        `}
    </style> */}
    {/* <ChakraProvider theme={theme}> */}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    {/* </ChakraProvider> */}
    </>
  )
}

export default MyApp