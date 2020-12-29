import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  registerAlertPv: ['alertPvData'],
  removeRegisterAlertPv: ['alertKey'],
  registerAlertZoneDeDanger: ['alertZoneDeDangerData'],
  removeRegisterAlertZoneDeDanger: ['alertKey'],
})

export const GithubTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  alertPvData: null,
  alertZoneDeDangerData: null
})

/* ------------- Reducers ------------- */

// request the avatar for a user
export const registerAlertPV = (state, { alertPvData }) =>{

  var arrAlertPvData = [];
  if(state.alertPvData){
    arrAlertPvData = [].concat(state.alertPvData);
  }
  var concatAlertPvData = arrAlertPvData.concat(alertPvData); 
  return state.merge({ alertPvData: concatAlertPvData });
}

export const removeRegisterAlertPv = (state, { alertKey }) =>{
  var arrAlertPvData = [];
  if(state.alertPvData){
    arrAlertPvData = [].concat(state.alertPvData);
  }
  indexAlertPv = arrAlertPvData.findIndex(eachConcatAlertPvData => eachConcatAlertPvData.alertKey === alertKey);
  arrAlertPvData.splice(indexAlertPv, 1);
  return state.merge({ alertPvData: arrAlertPvData })
}

export const registerAlertZoneDeDanger = (state, { alertZoneDeDangerData }) =>{
  var arrAlertZoneDeDangerData = [];
  if(state.alertZoneDeDangerData){
    arrAlertZoneDeDangerData = [].concat(state.alertZoneDeDangerData);
  }
  var concatAlertZoneDeDangerData = arrAlertZoneDeDangerData.concat(alertZoneDeDangerData); 
  return state.merge({ alertZoneDeDangerData: concatAlertZoneDeDangerData });
}

export const removeRegisterAlertZoneDeDanger = (state, { alertKey }) =>{
  var arrAlertZoneDeDangerData = [];
  if(state.alertZoneDeDangerData){
    arrAlertZoneDeDangerData = [].concat(state.alertZoneDeDangerData);
  }

  indexZoneDeDanger = arrAlertZoneDeDangerData.findIndex(eachConcatAlertZoneDeDanger => eachConcatAlertZoneDeDanger.alertKey === alertKey);
  arrAlertZoneDeDangerData.splice(indexZoneDeDanger, 1);
  return state.merge({ alertZoneDeDangerData: arrAlertZoneDeDangerData })
}
/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.REGISTER_ALERT_PV]: registerAlertPV,
  [Types.REMOVE_REGISTER_ALERT_PV]: removeRegisterAlertPv,
  
  [Types.REGISTER_ALERT_ZONE_DE_DANGER]: registerAlertZoneDeDanger,
  [Types.REMOVE_REGISTER_ALERT_ZONE_DE_DANGER]: removeRegisterAlertZoneDeDanger,
})
