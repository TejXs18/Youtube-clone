import React, { useState, useEffect } from 'react';
import './Comment.css';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { editcomment, deletecomment } from '../../action/comment';
import axios from 'axios';

const BASE_URL = "https://youtube-clone-pd9i.onrender.com";

const Displaycomments = ({ cid, commentbody, userid, commenton, usercommented, commentcity, likes = [], dislikes = [] }) => {
  const [edit, setEdit] = useState(false);
  const [editedCommentBody, setEditedCommentBody] = useState('');
  const [commentid, setCommentId] = useState('');
  const [showTranslateOptions, setShowTranslateOptions] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.currentuserreducer);

  const userId = currentUser?.result?._id;
  const hasLiked = likes.includes(userId);
  const hasDisliked = dislikes.includes(userId);

  // Fetch supported languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/comment/languages`);
        setSupportedLanguages(response.data);
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };
    fetchLanguages();
  }, []);

  const handleEdit = (ctid, ctbdy) => {
    setEdit(true);
    setCommentId(ctid);
    setEditedCommentBody(ctbdy);
  };

  const handleonsubmit = (e) => {
    e.preventDefault();
    if (!editedCommentBody.trim()) {
      alert("Type your comment");
      return;
    }
    dispatch(editcomment({ id: commentid, commentbody: editedCommentBody }));
    setEditedCommentBody('');
    setEdit(false);
  };

  const handleDel = () => {
    dispatch(deletecomment(cid));
  };

  const handleLike = () => {
    dispatch({ type: 'LIKE_COMMENT', payload: { commentId: cid, userId } });
  };

  const handleDislike = () => {
    dispatch({ type: 'DISLIKE_COMMENT', payload: { commentId: cid, userId } });
    if (dislikes.length + (hasDisliked ? 0 : 1) >= 2) {
      dispatch(deletecomment(cid));
    }
  };

  const handleTranslateToLanguage = async (targetLanguage) => {
    setIsTranslating(true);
    setTranslationError('');
    try {
      const response = await axios.post(`${BASE_URL}/comment/translate/${cid}`, {
        targetLanguage
      });
      setTranslatedText(response.data.translatedText);
      setShowTranslation(true);
      setShowTranslateOptions(false);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError('Translation failed. Please try again.');
    }
    setIsTranslating(false);
  };

  const handleTranslate = () => {
    setShowTranslateOptions(!showTranslateOptions);
  };

  const toggleOriginalText = () => {
    setShowTranslation(!showTranslation);
  };

  return (
    <div className="display_comment_box">
      {edit ? (
        <div className="comments_Sub_form_comments">
          <input
            type="text"
            onChange={(e) => setEditedCommentBody(e.target.value)}
            placeholder="Edit comment..."
            value={editedCommentBody}
            className="comment_ibox"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleonsubmit(e);
              }
            }}
          />
          <button onClick={handleonsubmit} className="comment_add_btn_comments">
            Change
          </button>
        </div>
      ) : (
        <div className="comment_text_container">
          {showTranslation && translatedText ? (
            <div className="translated-comment">
              <p className="comment_body translated">{translatedText}</p>
              <small className="translation-label">Translated text</small>
            </div>
          ) : (
            <p className="comment_body">{commentbody}</p>
          )}
          
          {translatedText && (
            <button 
              className="toggle-translation-btn" 
              onClick={toggleOriginalText}
            >
              {showTranslation ? 'Show Original' : 'Show Translation'}
            </button>
          )}
        </div>
      )}

      <p className="usercommented">
        {usercommented} ({commentcity || 'Unknown'}) commented {moment(commenton).fromNow()}
      </p>

      <div className="comment_actions">
        <button type="button" onClick={handleLike} disabled={hasLiked}>👍 {likes.length}</button>
        <button type="button" onClick={handleDislike} disabled={hasDisliked}>👎 {dislikes.length}</button>
        <button type="button" onClick={handleTranslate}>🌐 Translate</button>
        {currentUser?.result._id === userid && (
          <span className="EditDel_DisplayComment">
            <i onClick={() => handleEdit(cid, commentbody)}>Edit</i>
            <i onClick={handleDel}>Delete</i>
          </span>
        )}
      </div>
      
      {/* Translation Options Dropdown */}
      {showTranslateOptions && (
        <div className="translation-options">
          <h4>Select Language:</h4>
          {isTranslating ? (
            <p><span className="spinner" style={{marginRight: '0.5rem'}}>🔄</span>Translating...</p>
          ) : (
            <div className="language-grid">
              {Object.entries(supportedLanguages).slice(0, 10).map(([code, language]) => (
                <button 
                  key={code} 
                  className="language-btn"
                  type="button"
                  onClick={() => handleTranslateToLanguage(code)}
                >
                  {language}
                </button>
              ))}
            </div>
          )}
          {translationError && !isTranslating && (
            <p className="translation-error" style={{color: 'red', marginTop: '0.5rem'}}>{translationError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Displaycomments;
