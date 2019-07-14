import React from "react";
import { Anchor, Box, Heading, Text } from "grommet";
import { Github } from "grommet-icons";

const Home = (props) => {
  return (
    <Box justify="center" align="center" fill>
      <Heading color="brand">Welcome to MemoLinks</Heading>
      <Text>Create Bookmarks Categories, Add Links to yours categories </Text><br/>
      <Text color="brand"><strong>Done !!!</strong></Text><br/><br />
      <Text>Memolinks is Free and Opensource, no ads, no tracking ...</Text><br/>
      <Anchor color="dark-1" icon={<Github size="xlarge"/>} href="https://github.com/BlunT76/memolink" />
    </Box>
  )
};

export default Home;
