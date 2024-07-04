import classNames from 'classnames/bind';
import styles from './Video.module.scss';
import React, { useRef, useState, useEffect } from 'react';
import MenuAction from './MenuAction';
import FooterVideo from './FooterVideo';
const cx = classNames.bind(styles);

function Video({ source, author, image, id, ...passProps }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handlePlayPause = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleVolumeChange = (e) => {
        videoRef.current.volume = e.target.value;
        setVolume(e.target.value);
    };

    const handleTimelineChange = (e) => {
        const time = videoRef.current.duration * (e.target.value / 100);
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const handleTimeUpdate = () => {
        const value = (100 / videoRef.current.duration) * videoRef.current.currentTime;
        setCurrentTime(videoRef.current.currentTime);
        document.getElementById('timebar').value = value;
    };

    useEffect(() => {
        const updateDuration = () => {
            setDuration(videoRef.current.duration);
        };

        const currentVideo = videoRef.current;

        if (currentVideo) {
            currentVideo.addEventListener('loadedmetadata', updateDuration);
            currentVideo.addEventListener('timeupdate', handleTimeUpdate);
        }

        return () => {
            if (currentVideo) {
                currentVideo.removeEventListener('loadedmetadata', updateDuration);
                currentVideo.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };
    }, []);

    return (
        <div className={cx('media-container')}>
            <div className={cx('video-container')}>
                <video ref={videoRef} loop preload="auto" className={cx('video-item')}>
                    <source src={source} type="video/mp4" />
                </video>
                <div className={cx('footer-video-container')}>
                    <FooterVideo
                        idVideo={id}
                        author={author}
                        isPlaying={isPlaying}
                        handlePlayPause={handlePlayPause}
                        handleTimelineChange={handleTimelineChange}
                        handleVolumeChange={handleVolumeChange}
                        volume={volume}
                    />
                </div>
            </div>
            <div className={cx('action-menu')}>
                <MenuAction image={image} />
            </div>
        </div>
    );
}

export default Video;
