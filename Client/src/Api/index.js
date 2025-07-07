import axios from "axios";

// For local development, uncomment the following line:
// const API = axios.create({ baseURL: "http://localhost:5000" });

const API = axios.create({ baseURL: "https://youtube-clone-pd9i.onrender.com" });

API.interceptors.request.use((req) => {
  if (localStorage.getItem("Profile")) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("Profile")).token}`;
  }
  return req;
});

// Auth
export const login = (authdata) => API.post("/user/login", authdata);
export const updatechaneldata = (id, updatedata) => API.patch(`/user/update/${id}`, updatedata);
export const fetchallchannel = () => API.get("/user/getallchannel");

// Video
export const uploadvideo = (filedata, fileoption) => API.post("/video/uploadvideo", filedata, fileoption);
export const getvideos = () => API.get("/video/getvideos");
export const likevideo = (id, action) => API.patch(`/video/like/${id}`, { action });
export const viewsvideo = (id) => API.patch(`/video/view/${id}`);

// Comment
export const postcomment = (commentdata) => API.post('/comment/post', commentdata);
export const deletecomment = (id) => API.delete(`/comment/delete/${id}`);
export const editcomment = (id, commentbody) => API.patch(`/comment/edit/${id}`, { commentbody });
export const getallcomment = () => API.get('/comment/get');
export const likecomment = (id, userId) => API.patch(`/comment/like`, { id, userId });
export const dislikecomment = (id, userId) => API.patch(`/comment/dislike`, { id, userId });
export const translateComment = (id, targetLanguage) => API.post(`/comment/translate/${id}`, { targetLanguage });
export const getSupportedLanguages = () => API.get('/comment/languages');

// History
export const addtohistory = (historydata) => API.post("/video/history", historydata);
export const getallhistory = () => API.get('/video/getallhistory');
export const deletehistory = (userid) => API.delete(`/video/deletehistory/${userid}`);

// Liked Videos
export const addtolikevideo = (likedvideodata) => API.post('/video/likevideo', likedvideodata);
export const getalllikedvideo = () => API.get('/video/getalllikevide');
export const deletelikedvideo = (videoid, viewer) => API.delete(`/video/deletelikevideo/${videoid}/${viewer}`);

// Watch Later
export const addtowatchlater = (watchlaterdata) => API.post('/video/watchlater', watchlaterdata);
export const getallwatchlater = () => API.get('/video/getallwatchlater');
export const deletewatchlater = (videoid, viewer) => API.delete(`/video/deletewatchlater/${videoid}/${viewer}`);

// 🔹 Groups
export const createGroup = (groupData) => API.post('/group/create', groupData);
export const addMember = (memberData) => API.patch('/group/add-member', memberData);
export const searchGroups = (query) => API.get(`/group/search?query=${query}`);
export const fetchGroupById = (groupId) => API.get(`/group/${groupId}`);
export const inviteToGroup = (groupId, email) => API.post(`/group/${groupId}/invite`, { email });
export const getAllGroups = () => API.get('/group/all');

