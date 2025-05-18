import React from 'react';
import YouTube from 'react-youtube';

function MovieCLip(props) {
    const options = {
        playerVars: {
          autoplay: 1,
          controls: 1,
        }
    };

    function _onReady(e) { e.target.pauseVideo(); }

    return (
        <>
            <YouTube videoId={props.recipeVideoId} options={options} onReady={_onReady} id="video" className='youtube-player my-3' slot='media'/>
        </>
    );
}

export default MovieCLip;


