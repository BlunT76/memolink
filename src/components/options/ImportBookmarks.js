import React, { PureComponent } from "react";
import { connect } from 'react-redux';
import { Anchor, Box, Button, Heading, Text, Meter } from "grommet";
import { Upload, Close } from 'grommet-icons';
import eol from 'eol';
import apiPost from '../../api/apiPost';

const mapStateToProps = (state) => {
  const {
    user, lists, links,
  } = state;
  return {
    user, lists, links,
  };
};

class ImportBookmarks extends PureComponent {
  constructor() {
    super();
    this.countLinks = 0;
    this.reader = null;
    this.state = {
      arrCategories: null,
      arrLinks: null,
      catId: 0,
      arrLinksIndex: -1,
      importStarted: false,
      uploadData: 0,
      totalLinks: 0,
      uploadError: [],
      showErrors: false,
    };
  }

  handleChangeFile = async (event, callback) => {
    this.setState({importStarted: true})
    const reader = new FileReader();
    reader.onload = function(event) {
      // The file's text will be parsed here
      let arr = []
      let categories = []
      let i = 0;
      const data = event.target.result;
      let lines = eol.split(data)
      lines.forEach((line, index) => {
        const l = line.trim();
        if (l.includes('<H1')){
          // it's the main category
          const cat = l.split('>')[1].replace(/<\/H1/gi, '');
          categories.push(cat);
          arr.push([]);
          i = categories.indexOf(cat)
        }
        if (l.includes('<H3')){
          // it's a category
          const cat = l.split('">')[1].replace(/<\/H3>/gi, '');
          categories.push(cat);
          arr.push([]);
          i = categories.indexOf(cat)
        }
        if (l.includes('<A')){
          // it's a link
          const link = l.split('"')[1];
          const label = l.split('">')[1].replace(/<\/A>/gi, '')
          arr[i].push({label, link})
        }
        if (l.startsWith('</DL><p>')){
          i = 0
        }
      })
      callback(categories, arr)
    }
    reader.readAsText(event, function(elm) {
    })
  }

  importReaderCallback = (arrCategories, arrLinks) => {
    let count = 0;
    for(let i = 0; i < arrLinks.length; i += 1){
      count += arrLinks[i].length;
    }
    this.setState({arrCategories, arrLinks, totalLinks: count})
    this.processCategories(this.state.arrCategories)
  }

  processCategories = async (array) => {
    for (const item of array) {
      await this.delayedCategories(item);
    }
  }

  delayedCategories = async (item) => {
    await this.postCategories(item);
  }

  postCategories = async (title) => {
    const { user } = this.props;
    const data = { title, users_id: user.userid };
    const res = await apiPost(user.jwt, 'categories', data);
    if (res.status === 200) {
      const { arrLinks, arrLinksIndex } = this.state;
      this.setState({catId: res.data, arrLinksIndex: arrLinksIndex + 1}, () => {
        const { catId, arrLinksIndex } = this.state;
        this.processLinks(arrLinks[arrLinksIndex], catId)
      });
    }
  }

  processLinks = async (array, catId) => {
    for (const item of array) {
      await this.delayedLinks(item, catId);
    }
    this.checkErrors();
  }

  delayedLinks = async (item, catId) => {
    await this.postLinks(item.link, item.label, catId);
  }

  postLinks = async (link, label, index) => {
    const { user } = this.props;
    const { totalLinks, uploadError } = this.state;
    const data = { link, label, categories_id: index, users_id: user.userid };
    const res = await apiPost(user.jwt, 'links', data);
    
    if (res.status === 200 && Number.isInteger(res.data)) {
      const count = Math.ceil(this.countLinks * 100 / totalLinks);
      this.countLinks += 1;
      this.setState({uploadData: count })
    } else {
      this.countLinks += 1;
      let tmpArray = uploadError;
      tmpArray.push(data);
      this.setState({uploadError: tmpArray})
    }
  }

  checkErrors = () => {
    this.setState({showErrors: true})
  }

  onDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.style.border = 'dashed 2px #1976D2'
  }

  onDrop = async (event) => {
    event.preventDefault();
    this.handleChangeFile(event.dataTransfer.files[0], this.importReaderCallback)
  }

  render() {
    const { importStarted, uploadData, uploadError, showErrors } = this.state;
    const { showSettingsPage } = this.props;

    return (
        <Box align="center" fill className="tabs" style={{paddinLeft: "4px !important", paddinRight: "4px !important"}}>
          <Button
            alignSelf="end"
            margin="small"
            icon= {<Close />}
            onClick={() => showSettingsPage()}
          />
          <Heading color="dark-1" size='3'>Import your bookmarks from Firefox or Chrome</Heading>
          <Heading color="status-error" size='4'>Experimental</Heading>
          {!importStarted &&<br />}
          {!importStarted &&
            <Box
              onDragOver={elm => this.onDragOver(elm)}
              onDrop={elm => this.onDrop(elm)}
              justify="center"
              align="center"
              style={{border: 'dashed 2px #1976D2', width: '50%', height:'25%'}}
            >
              <Text color="dark-1">Drag n drop the file here</Text>
            </Box>
          }
          {!importStarted &&<br />}
          {!importStarted &&<Text color="dark-1">Or use the file dialog</Text>}
          {!importStarted &&<br />}
          {!importStarted && <Box pad="none">
            <Button
              plain
              style={{borderRadius:"0", color:"#FFFFFF", padding: "0", width:'250px', height: '21px'}}
              margin="none"
              alignSelf="center"
              icon={<Upload size="small"/>}
              label="Choose a file"
              hoverIndicator="neutral-2"
              focusIndicator={false}
              primary
              onClick={this.onOpen}
            />
            <input
              type="file"
              style={{opacity: '0', position: 'relative', margin: 0, bottom: '21px', height: '21px'}}
              accept="text/html"
              onChange={e => this.handleChangeFile(e.target.files[0], this.importReaderCallback)}
            />
          </Box>}
        {importStarted && <Box>
          {uploadData < 99 ? <Text textAlign="center">Uploading {uploadData}%</Text> : <Text textAlign="center">Done !!</Text>}
          <Meter
            style={{paddinLeft: "4px", paddinRight: "4px"}}
            values={[{
              value: uploadData,
              label: 'uploading links',
              onClick: () => {}
            }]}
            aria-label="uploading links"
          />
        </Box>}
        {showErrors && uploadError.length > 0 && <Box>
          <Box
            overflow="visible"
            margin="large"
          >
            <Heading size='4' color="status-error" textAlign="center">{uploadError.length} Errors</Heading>
            <Text color="dark-1">This can be due to long labels or special characters, network error ...</Text>
            <Text color="dark-1">Copy paste this links before closing</Text>
            <hr />
          {uploadError.map((elm, i) => {
            return <Anchor
              key={elm.label.substring(0,5)+i}
              label={elm.link}
              href={elm.link}
              target="_blank"
              rel="noopener noreferrer"
              textAlign="start"
              color="dark-1"
            />
          }) }
          </Box>
        </Box>}
      </Box>
    );
  }
}

export default connect(mapStateToProps)(ImportBookmarks);
