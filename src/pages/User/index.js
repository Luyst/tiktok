import React, { useState, useEffect, useContext } from 'react';
import { getUserByNameID, getVideosByNameID, addDocument, delFollow } from '~/service/service';

import classNames from 'classnames/bind';
import styles from './User.module.scss';
import { UserContext } from '~/context/UserProvider';
import UserVideo from './UserVideo';
import { useParams } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import Icons from '~/component/Icons';

const cx = classNames.bind(styles);
const isVideo = (url) => /\.(mp4|mov|avi|webm)$/i.test(url);

export default function User() {
    const [tabStyle, setTabStyle] = useState({ tabPosition: '0px', tabWidth: '60px' });
    const [activeTab, setActiveTab] = useState('v1');
    const [videos, setVideos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null);
    const { query } = useParams();
    const currentUserInfo = useContext(UserContext);
    const currentUser = currentUserInfo.user;
    const [followList, setFollowList] = useState(currentUserInfo.following);

    useEffect(() => {
        if (query) {
            const getUser = async () => {
                try {
                    const userInfor = await getUserByNameID(query);
                    setUser(userInfor);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                }
            };
            getUser();
        } else {
            setUser(currentUser);
        }
    }, [query, currentUser]);
    useEffect(() => {
        if (user && user.uid) {
            const fetchVideos = async () => {
                try {
                    const videoList = await getVideosByNameID(user.nameID);
                    setVideos(videoList);
                } catch (error) {
                    console.error('Failed to fetch videos:', error);
                }
            };
            fetchVideos();
        }
    }, [user, user?.uid]);

    useEffect(() => {
        document.title = user ? `${user.displayName}` : 'User Profile';
    }, [user]);

    const hoverNav = (id) => {
        switch (id) {
            case 'v1':
                setTabStyle({ tabPosition: '0px', tabWidth: '60px' });
                break;
            case 'videos':
                setTabStyle({ tabPosition: '130px', tabWidth: '80px' });
                break;
            case 'collections':
                setTabStyle({ tabPosition: '286px', tabWidth: '78px' });
                break;
            default:
                setTabStyle({ tabPosition: '0px', tabWidth: '60px' });
        }
    };

    const leaveNav = () => {
        switch (activeTab) {
            case 'v1':
                setTabStyle({ tabPosition: '0px', tabWidth: '60px' });
                break;
            case 'videos':
                setTabStyle({ tabPosition: '130px', tabWidth: '80px' });
                break;
            case 'collections':
                setTabStyle({ tabPosition: '286px', tabWidth: '78px' });
                break;
            default:
                setTabStyle({ tabPosition: '0px', tabWidth: '60px' });
        }
    };

    const clickNav = (id) => {
        setActiveTab(id);
    };

    const runTabStyle = {
        left: tabStyle.tabPosition,
        width: tabStyle.tabWidth,
    };

    const handleEdit = () => {
        setShowModal(true);
    };
    const handleFollow = async (e) => {
        const userFollowing = e.target.name;
        if (currentUser === null) {
            alert('You must sign in first 💚');
        } else {
            try {
                await addDocument('follow', {
                    userFollower: currentUser.nameID,
                    userFollowings: userFollowing,
                });
                let storeUser = JSON.parse(localStorage.getItem('followings'));
                storeUser.push(userFollowing);
                localStorage.setItem('followings', JSON.stringify(storeUser));
                setFollowList([...followList, userFollowing]);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleUnFollow = async (e) => {
        const userUnFollow = e.target.name;
        try {
            await delFollow(currentUser.nameID, userUnFollow);
            setFollowList(followList.filter((user) => user !== userUnFollow));
            let storeUser = JSON.parse(localStorage.getItem('followings'));
            storeUser = storeUser.filter((user) => user !== userUnFollow);
            console.log(storeUser);
            localStorage.setItem('followings', JSON.stringify(storeUser));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={cx('wrapper')}>
            {user ? (
                <>
                    <div className={cx('user-container')}>
                        <div className={cx('information-container')}>
                            <div className={cx('realName-top')}>{user.displayName}</div>

                            <div>
                                <img className={cx('avatar')} src={user.photoURL} alt="avatar" />
                            </div>
                            <div className={cx('name-information')}>
                                <div className={cx('nickName')}>{user.nameID}</div>
                                <div className={cx('realName')}>{user.displayName}</div>
                                {currentUser && currentUser.nameID === user.nameID ? (
                                    <button type="button" className={cx('button-rebuild')} onClick={handleEdit}>
                                        Edit Profile
                                    </button>
                                ) : followList && followList.includes(user.nameID) ? (
                                    <button
                                        onClick={handleUnFollow}
                                        name={user.nameID}
                                        className={cx('following-button')}
                                    >
                                        <i className={Icons.following}></i>
                                    </button>
                                ) : (
                                    <button onClick={handleFollow} name={user.nameID} className={cx('follow-button')}>
                                        Follow
                                    </button>
                                )}
                            </div>
                        </div>
                        <ul className={cx('count-infor')}>
                            <li>
                                {user.following}
                                <span>Following</span>
                            </li>
                            <li>
                                {user.follower}
                                <span>Follower</span>
                            </li>
                            <li>
                                {user.liked}
                                <span>Liked</span>
                            </li>
                        </ul>
                        <div className={cx('description')}>
                            <p>{user.bio}</p>
                        </div>
                    </div>
                    <div className={cx('nav-tab')}>
                        <ul>
                            <li
                                onMouseEnter={() => hoverNav('v1')}
                                onMouseLeave={leaveNav}
                                onClick={() => clickNav('v1')}
                            >
                                <div>Video</div>
                            </li>
                            <li
                                onMouseEnter={() => hoverNav('videos')}
                                onMouseLeave={leaveNav}
                                onClick={() => clickNav('videos')}
                            >
                                <div>Yêu thích</div>
                            </li>
                            <li
                                onMouseEnter={() => hoverNav('collections')}
                                onMouseLeave={leaveNav}
                                onClick={() => clickNav('collections')}
                            >
                                <div>Đã thích</div>
                            </li>
                        </ul>
                        <div className={cx('borderRun')} style={runTabStyle}></div>
                    </div>
                    {videos.map((item, index) => (
                        <div key={index} className="relative w-full aspect-[9/16] rounded-lg overflow-hidden">
                            {isVideo(item.url) ? (
                                <UserVideo videos={videos} />
                            ) : (
                                <img src={item.url} alt={`upload-${index}`} className="w-full h-full object-cover" />
                            )}
                        </div>
                    ))}

                    {showModal && (
                        <div className={cx('modal-container')}>
                            <EditProfileModal
                                user={user}
                                show={showModal}
                                handleClose={() => setShowModal(false)}
                                formData={{
                                    displayName: user.displayName,
                                    photoURL: user.photoURL,
                                    username: user.nameID,
                                    description: user.bio,
                                }}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div>No user found with this name</div>
            )}
        </div>
    );
}
