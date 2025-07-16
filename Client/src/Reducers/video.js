const videoreducer=(state={data:null},action)=>{
    switch (action.type) {
        case 'POST_VIDEO':
            return {...state};
        case 'POST_LIKE': {
            // action.payload should be the updated video object from backend
            if (!state.data) return state;
            const updatedVideo = action.payload;
            const updatedData = state.data.map(video =>
                video._id === updatedVideo._id ? { ...video, Like: updatedVideo.Like } : video
            );
            return { ...state, data: updatedData };
        }
        case 'POST_VIEWS':
            return {...state};
        case 'FETCH_ALL_VIDEOS':
            return {...state,data:action.payload};
        default:
            return state;
    }
}
export default videoreducer