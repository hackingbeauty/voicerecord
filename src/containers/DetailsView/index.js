import React, { Component }   from 'react';
import { connect }            from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter }         from 'react-router';
import { IconButton }         from 'material-ui';
import Button                 from 'components/Button';
import Drawer                 from 'components/Drawer';
import AppBar                 from 'components/AppBar';
import TextField              from 'components/TextField';
import NavigationClose        from 'material-ui/svg-icons/navigation/close';
import PlayButton             from 'material-ui/svg-icons/av/play-arrow';
import Checkmark              from 'material-ui/svg-icons/action/check-circle';
import { saveRecording }      from 'react-mic';
import { getAll }             from 'core/libs/lib-cache';

/* actions */
import * as uiActionCreators    from 'core/actions/actions-ui';
import * as audioActionCreators from 'core/actions/actions-audio';

/* component styles */
import { styles } from './styles.scss';

class DetailsView extends Component {
  constructor(props) {
    super(props);
    this.saveAudio = this.saveAudio.bind(this);
    this.state = {
      inputValue : '',
      audioBlob  : null
    }
  }

  componentDidMount() {
    const { actions } = this.props;

    getAll().then((list) => {
      this.findRecordId(list);
    });
  }

  componentWillReceiveProps() {
   this.findRecordId();
  }

  findRecordId= (listFromStorage) => {
    const list = listFromStorage || this.props.audio.list;

    if(list && list.length){
      const audioBlob = list.find((item)=> {
        return item.id === this.getCurrentId();
      });
      this.setState({
        audioBlob: audioBlob
      });
    }
  }

  getCurrentId() {
    const { pathname } = this.props.router.location;
    const currentId = pathname.split('/')[2];
    return currentId;
  }

  closeNav = () => {
    this.props.router.push('/recordings');
  }

  onKeyPress= (event) => {
    if(event.key === 'Enter') {
      this.saveAudio();
    } else {
      this.setState({
        inputValue: event.target.value
      });
    }
  }

  saveAudio() {
    const { inputValue } = this.state;
    const currentId = this.getCurrentId();
    let title;

    if(inputValue) {
      title = inputValue;
      this.props.actions.audio.saveAudio(currentId, title);
    } else {
      title='Untitled';
      this.props.actions.audio.saveAudio(currentId, title);
    }
  }

  playAudio = () => {
    this.refs.audioSource.play();
  }

  getContent() {
    const { audioBlob } = this.state;
    let body;

    if(audioBlob === null) {
      body = (<div>Processing</div>);

    } else if (audioBlob) {
      const { title } = this.state.audioBlob;
      const { blobURL } = this.state.audioBlob;

      body = (<div>
              <span>{title}</span>
              <Button
                className="btn play"
                floating={true}
                icon={<PlayButton />}
                onTouchTap={this.playAudio}
                secondary={true} />
              <audio ref="audioSource" controls="controls">
                <source src={blobURL} type="audio/webm" />
              </audio>
            </div>);
    } else {
      body = (<TextField
              ref="textField"
              onKeyPress={this.onKeyPress}
              autoFocus
              hintText="Enter a Title"
              value={this.state.inputValue} />);
    }
    return(
      <div>
        <header>
          <IconButton className="btn close" onTouchTap={this.closeNav}>
            <NavigationClose/>
          </IconButton>
        </header>
        <div className="details-view-body">
          {body}
        </div>
      </div>
    );
  }

  render() {
    const content = this.getContent();

    return (
      <div className={styles}>
        <Drawer
          width={500}
          open={this.props.ui.rightNavOpen}
          containerClassName="right-drawer"
          openSecondary={true}
          onRequestChange={this.closeNav}
          content={content} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ui   : state.ui,
    audio: state.audio
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ui    : bindActionCreators(uiActionCreators, dispatch),
      audio : bindActionCreators(audioActionCreators, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withRouter(DetailsView)));