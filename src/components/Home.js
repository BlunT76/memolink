import React from "react";
import { Anchor, Box, Heading, Text, Image } from "grommet";
import { Github } from "grommet-icons";
import screenshot from '../img/Chrome-extension-memolinks.png';

const Home = (props) => {
  return (
    <Box justify="center" align="center" fill>
      <Heading color="brand">Welcome to MemoLinks</Heading>
      <Text color="dark-1">Create Bookmarks Categories, Add Links to yours Categories,  </Text><br/>
      <Text color="brand"><strong>Done !!!</strong></Text><br/>
      <Text color="dark-1">Activate Public ON and Share your MemoLinks with friends !!!</Text><br/>
      <Box direction="row" align="center">
        <Box height="small" width="small">
          <Image
            fit="contain"
            src={screenshot}
            alt="Extension screenshot"
          />
        </Box>
        <Text color="dark-1">
          A Chrome extension is available.
          <br/>Add links to MemoLink with 3 clicks !!!
          <br/>
          <Anchor color="brand" href="https://philpereira.alwaysdata.net/memolink/chrome-ext-memolinks-1.0.0.crx">Download</Anchor>
          <br />
          Drag and drop the CRX file onto the Extensions page to install it.
        </Text>
      </Box>
      <br/>
      <Text color="dark-1">MemoLinks is Free and Opensource, no ads, no tracking ...</Text>
      <Anchor color="dark-1" icon={<Github size="medium"/>} href="https://github.com/BlunT76/memolink" />
    </Box>
  )
};

export default Home;
