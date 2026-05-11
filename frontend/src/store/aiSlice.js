import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [], // { text, sender: 'user' | 'ai', type: 'text' | 'tasks' | 'summary' | 'search', data? }
  isOpen: false,
  isLoading: false,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    }
  },
});

export const { toggleChat, addMessage, setLoading, clearMessages } = aiSlice.actions;
export default aiSlice.reducer;
