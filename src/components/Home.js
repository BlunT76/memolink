import React from "react";
import { Anchor, Box, Heading, Text, Image } from "grommet";
import { Github, FormNextLink } from "grommet-icons";
import screenshot from '../img/Chrome-extension-memolinks.png';

const Home = (props) => {
  return (
    <Box  align="center" pad="small">
      <Heading color="brand" textAlign="center" margin="xsmall">Welcome to MemoLinks</Heading>
      <Heading level="2" size="small" textAlign="center" color="dark-1" margin="xsmall">MemoLinks is an easy to use Bookmark Manager.</Heading>
      <div align="left">
      <Text color="dark-1">Create Bookmarks Categories, Add Links to yours Categories, Done !!!</Text><br />
      <FormNextLink style={{verticalAlign: 'bottom'}} size="medium"/><Text color="dark-1" textAlign="start">Imports / Exports compatible with Chromium based and Firefox browsers</Text><br />
      <FormNextLink style={{verticalAlign: 'bottom'}} size="medium"/><Text color="dark-1" textAlign="start">Share your MemoLinks with friends by activating the public mode</Text><br />
      <FormNextLink style={{verticalAlign: 'bottom'}} size="medium"/><Text color="dark-1">Choose which categories are public</Text><br />
      <FormNextLink style={{verticalAlign: 'bottom'}} size="medium"/><Text color="dark-1">Follow an user's new links with a JSON Feed</Text><br />
      <FormNextLink style={{verticalAlign: 'bottom'}} size="medium"/><Text color="dark-1">Reorganize yours links by drag and drop</Text><br />
      <FormNextLink style={{verticalAlign: 'bottom'}} size="medium"/><Text color="dark-1">Search links easily</Text><br />
      <FormNextLink style={{verticalAlign: 'bottom'}} size="medium"/><Text color="dark-1">Available extension to add links with url and title auto detection</Text><br />

      </div>
      <hr />
      <div>
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
      </div>
      <hr />
      <Text color="dark-1">MemoLinks is Free and Opensource, no ads, no tracking ...</Text>
      <Anchor color="dark-1" icon={<Github size="medium"/>} href="https://github.com/BlunT76/memolink" />
    </Box>
  )
};

export default Home;
