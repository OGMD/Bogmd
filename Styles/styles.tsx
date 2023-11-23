import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  main:{
    flexDirection:'column',
    flex:1,
    padding:15
  },
  baseText: {
    fontSize: 24,
    fontFamily: 'Cochin',
    color:'white',
    marginBottom:10
  },
  titleText: {
    fontSize: 34,
    fontWeight: 'bold'
  },
  rowView: {
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  header:{
    height:30,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    position:'relative'
  },
  tinyLogo:{
    width:30,
    height:30,
  },
  tinyLogo2:{
    width:35,
    height:48,
    marginTop:5
  },
  tinyLogo3:{
    width:45,
    height:48,
    marginTop:5
  },
  HeaderTitle:{
    alignSelf:'center',
    width:50,
    textAlign:'center',
    fontSize:18,
    fontWeight:'600',
    marginRight:10,
    color:'rgb(38, 80, 115)'
    
  },
  tinyBell:{
    width:20,
    height:20,
    marginRight:10
  },
  connect:{
    marginTop:20,
    flex:2,
    flexDirection:'row'
  },
  connectContainer:{
    flexDirection:'column',
    paddingLeft: 10
  },
  Monitoring:{
    flex:2,
    backgroundColor:'rgb(38, 80, 115)',
    borderRadius:30,
    justifyContent:'center',
    alignContent:'center',
    alignItems:'center'
  },
  checkState:{
    flex:1,
    marginTop:20,
    flexDirection:'row'
  },
  title:{
    fontSize:32,
    fontWeight:'bold',
    color:'rgb(38, 80, 115)'
  },
  subtitle:{
    width:190,
    paddingTop:5,
    fontSize: 16,
    color:'black'
  },
  buttonContainer:{
    width:'50%',
    paddingLeft:10,
    paddingTop:'10%'

  },
  baseText2:{
    color:'#ECF4D6',
    marginBottom:10
  },
  baseText3:{
    fontSize:80,
    color:'#ECF4D6'
  },
  sistema:{
    fontSize:15,
    color:'black',
    fontWeight:'600',
  },
  SisContainer:{
    width:'70%',
    height:'70%',
    padding:5,
    marginLeft:20
  },
  devices:{
    flex:2,
    flexDirection:'row',
    justifyContent:'space-around'
  },
  card:{
    width:'45%',
    borderRadius:15,
    backgroundColor:'rgba(45, 149, 150,.2)',
    padding:10,
    flexDirection:'column'
  }
});
