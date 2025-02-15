import { UniformContext } from "@uniformdev/context-react";
import { UniformAppProps } from "@uniformdev/context-next";
import createUniformContext from "lib/uniform/uniformContext";

// IMPORTANT: importing all components registered in Canvas
import "../components/canvasComponents";

import "../styles/styles.css";
import { AppContext } from "next/app";
import { getSegmentIds } from "@/lib/adobe-cdp/profile-util";

const clientContext = createUniformContext();

function MyApp({
  Component,
  pageProps,
  serverUniformContext,
}: UniformAppProps<{ segmentIds: string[] }>) {
  const context = serverUniformContext ?? clientContext;
  // setting segment ids as quirks
  if (pageProps.segmentIds && pageProps.segmentIds.length) {
    const segments = pageProps.segmentIds.join("|");
    context.update({
      quirks: {
        segments,
      },
    });
  }
  return (
    <UniformContext context={context}>
      <Component {...pageProps} />
    </UniformContext>
  );
}

MyApp.getInitialProps = async (context: AppContext) => {
  const segmentIds = await getSegmentIds(context.ctx?.req?.headers?.cookie);
  return {
    pageProps: { segmentIds },
  };
};

export default MyApp;
