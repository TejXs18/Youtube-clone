import * as api from "../Api/index";

export const uploadvideo = (videodata) => async (dispatch) => {
    try {
        const { filedata, fileoption } = videodata;
        console.log(filedata,fileoption)
        const { data } = await api.uploadvideo(filedata, fileoption)
        dispatch({ type: 'POST_VIDEO', data })
        dispatch(getallvideo())
    } catch (error) {
        alert(error.response.data.message)
    }
}

export const getallvideo = () => async (dispatch) => {
    try {
        const { data } = await api.getvideos()
        dispatch({ type: 'FETCH_ALL_VIDEOS', payload: data })
    } catch (error) {
        console.log(error)
    }
}

export const likevideo = (likedata) => async (dispatch) => {
  try {
    const { id, action } = likedata;
    const response = await api.likevideo(id, action);
    dispatch({ type: "POST_LIKE", payload: response.data });
    return response;  // <-- Return the response so caller can await and destructure
  } catch (error) {
    console.log(error);
    throw error;  // Re-throw to allow caller to catch it
  }
};



export const viewvideo=(viewdata)=>async(dispatch)=>{
    try {
        const{id}=viewdata;
        console.log(id)
        const {data}=await api.viewsvideo(id)
        dispatch({type:"POST_VIEWS",data})
        dispatch(getallvideo())
    } catch (error) {
        console.log(error)
    }
}