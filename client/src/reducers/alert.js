import { ALERT_SETTED, ALERT_REMOVED } from "../actions/types";

const initialState = [];

const alertReducer = (state = initialState, action) => {
   const { type, payload } = action;
   switch (type) {
      case ALERT_SETTED:
         return !state.some((item) => item.msg === payload.msg)
            ? [...state, payload]
            : state;
      case ALERT_REMOVED:
         return state.filter((alert) => alert.id !== payload);
      default:
         return state;
   }
};

export default alertReducer;
