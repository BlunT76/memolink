import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Box, Button, Heading } from 'grommet';
import { Download, Close } from 'grommet-icons';

const mapStateToProps = (state) => {
  const {
    lists, links,
  } = state;
  return {
    lists, links,
  };
};

class ExportBookmarks extends PureComponent {
  generateBookmarks = () => {
    const { lists, links } = this.props;
    const date = Date.now();
    let content = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
      It will be read and overwritten.
      DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>\r\n`;

    for (let i = 0; i < lists.length; i += 1) {
      content += `<DT><H3 ADD_DATE="${date}" LAST_MODIFIED="${date}">${lists[i].title}</H3>\r\n`;
      for (let l = 0; l < links.length; l += 1) {
        if (links[l].categories_id === lists[i].id) {
          content += `  <DT><A HREF="${links[l].link}" ADD_DATE="${date}">${links[l].label}</A>\r\n`;
        }
      }
      content += '</DL><p>\r\n';
    }
    this.downloadBookmarks(content);
  }

  downloadBookmarks = (text) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', 'memolinks.html');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  render() {
    const { showSettingsPage } = this.props;
    return (
      <Box align="center" fill className="tabs">
        <Button
          alignSelf="end"
          margin="small"
          icon={<Close />}
          onClick={() => showSettingsPage()}
        />
        <Heading color="dark-1" size="3">Export your bookmarks</Heading>
        <Heading color="status-error" size="4">Experimental</Heading>

        <Button
          plain
          style={{
            borderRadius: '0', color: '#FFFFFF', padding: '0', width: '250px', height: '21px',
          }}
          margin="none"
          alignSelf="center"
          icon={<Download size="small" />}
          label="Export Bookmarks"
          hoverIndicator="neutral-2"
          focusIndicator={false}
          primary
          onClick={this.generateBookmarks}
        />
      </Box>
    );
  }
}

export default connect(mapStateToProps)(ExportBookmarks);
