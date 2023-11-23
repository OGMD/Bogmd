import React from 'react'
import { StyleSheet,TouchableOpacity,Text } from 'react-native'

interface Props{
    title:string;
    onPress:() => void;
    backgroundColor?:string;
    color?:string;
    fontSize?:number;
}

const ButtonC = (props:Props) => {
    const {title,onPress,backgroundColor,color,width,height,margin,borderRadius,fontSize} = props;
    return(
        <TouchableOpacity
            onPress={onPress}
            style={{...styles.container,height,width,backgroundColor,margin,borderRadius}}
        >
            <Text style={{
                ...styles.text,color,fontSize,
            }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container:{
        alignItems:'center',
        justifyContent:'center',
       /*  //borderRadius:20,
        shadowColor:"black",
        shadowOffset:{
            width:-10,
            height:10,
        },
        shadowOpacity:2.28,
        //shadowRadius:15.25,
        elevation:22 */
    },
    text:{
        alignItems:'center',
        fontWeight:'bold',
        letterSpacing:1.1,
       // fontSize:24
    }
})
ButtonC.defaultProps = {
    backgroundColor:'rgb(38, 80, 115)',
    color:"yellow",
    width:'33%',
    height:'50%',
    margin:5,
    borderRadius:100,
    fontSize:16

}

export default ButtonC;