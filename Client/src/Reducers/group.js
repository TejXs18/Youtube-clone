const groupreducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case "CREATE_GROUP":
      return { ...state, data: [...state.data, action.payload] };

    case "ADD_MEMBER": {
      const { groupId, member } = action.payload;

      const updatedGroups = state.data.map(group => {
        if (group._id === groupId) {
          const alreadyMember = group.members?.some(m => m._id === member._id);
          if (!alreadyMember) {
            return {
              ...group,
              members: [...(group.members || []), member]
            };
          }
        }
        return group;
      });

      return { ...state, data: updatedGroups };
    }

    
    case "GET_ALL_GROUPS": // ✅ Add this line
      return { ...state, data: action.payload };

    default:
      return state;
  }
};

export default groupreducer;
