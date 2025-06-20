import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Notification from "../../components/Notification";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import CommentCreateForm from "../comments/CommentCreateForm";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import appStyles from "../../App.module.css";
import { useParams } from "react-router-dom";
import { axiosReq } from "../../api/axiosDefaults";
import Post from "./Post";
import Comment from "../comments/Comment";
import PopularProfiles from "../profiles/PopularProfiles";

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState({ results: [] });
  const currentUser = useCurrentUser();
  const profile_image = currentUser?.profile_image;
  const [comments, setComments] = useState({ results: [] });
  const [notificationComment, setNotificationComment] = useState({
    show: false,
    message: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const location = useLocation();

  useEffect(() => {
    if (location.state?.showNotification) {
      setNotification({
        show: true,
        message: location.state.message || "Action completed successfully!",
      });

      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setNotification({ show: false, message: "" });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    if (notificationComment.show) {
      const timer = setTimeout(() => {
        setNotificationComment({ show: false, message: "" });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [notificationComment]);
  useEffect(() => {
    const handleMount = async () => {
      try {
        const [{ data: post }, { data: comments }] = await Promise.all([
          axiosReq.get(`/posts/${id}`),
          axiosReq.get(`/comments/?post=${id}`),
        ]);
        setPost({ results: [post] });
        setComments(comments);
      } catch (err) {}
    };

    handleMount();
  }, [id]);
  return (
    <>
      <Notification
        show={notification.show}
        message={notification.message}
        onClose={() => setNotification({ show: false, message: "" })}
      />
      <Notification
        show={notificationComment.show}
        message={notificationComment.message}
        onClose={() => setNotificationComment({ show: false, message: "" })}
      />
      <Row className="h-100">
        <Col className="py-2 p-0 p-lg-2" lg={8}>
          <PopularProfiles mobile />
          <Post {...post.results[0]} setPosts={setPost} postPage />
          <Container className={appStyles.Content}>
            {currentUser ? (
              <CommentCreateForm
                profile_id={currentUser.profile_id}
                profileImage={profile_image}
                post={id}
                setPost={setPost}
                setComments={setComments}
                setNotificationComment={setNotificationComment}
              />
            ) : comments.results.length ? (
              "Comments"
            ) : null}
            {comments.results.length ? (
              comments.results.map((comment) => (
                <Comment
                  key={comment.id}
                  {...comment}
                  setPost={setPost}
                  setComments={setComments}
                  setNotificationComment={setNotificationComment}
                />
              ))
            ) : currentUser ? (
              <span>No comments yet, be the first to comment!</span>
            ) : (
              <span>No comments... yet</span>
            )}
          </Container>
        </Col>
        <Col lg={4} className="d-none d-lg-block p-0 p-lg-2">
          <PopularProfiles />
        </Col>
      </Row>
    </>
  );
}

export default PostPage;
