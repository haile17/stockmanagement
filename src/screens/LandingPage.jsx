import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    Image, 
    StyleSheet, 
    Animated, 
    Easing, 
    TouchableOpacity, 
    ImageBackground,
    StatusBar,
    Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import logo from '../components/images/icon.png';
import backgroundImage from '../components/images/lion.jpg';
import Button from '../components/Button';
import { CircleFade  } from 'react-native-animated-spinkit'

function LandingPage({ onShown }) {
    const navigation = useNavigation();
    const spinValue = new Animated.Value(0);
    const [showButton, setShowButton] = useState(false);
    const logoTranslateY = useState(new Animated.Value(-200))[0];
    const logoOpacity = useState(new Animated.Value(0.2))[0]; 

    // Hide status bar when this screen is focused
    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setHidden(true, 'slide');
            
            // Cleanup function to restore status bar when leaving this screen
            return () => {
                StatusBar.setHidden(false, 'slide');
            };
        }, [])
    );

    // Run the loading animation for at least 5 seconds
    useEffect(() => {
        // Start the spinning animation
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000, // 1 second per rotation
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        Animated.parallel([
            Animated.timing(logoTranslateY, {
                toValue: 0,
                duration: 3000,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 3000,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();

        // Show button after 5 seconds
        const timer = setTimeout(() => {
            setShowButton(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    // Interpolate the spin value for rotation
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Handle button press to navigate to the next page
    const handleNavigate = () => {
        onShown(); // Notify App.jsx that the landing page has been shown
        navigation.navigate('Dashboard'); // Navigate to the Dashboard
    };

    return (
        <>
            <StatusBar hidden={true} />
            <ImageBackground 
                source={backgroundImage} 
                style={styles.backgroundImage}
                imageStyle={styles.backgroundImageStyle}
            >
                <View style={styles.container}>
                    <Animated.View style={{ transform: [{ translateY: logoTranslateY }], opacity: logoOpacity }}>
                        <Image source={logo} style={styles.logo} />
                    </Animated.View>
                    <View>
                    {!showButton ? (
                                <View style={styles.actionContainer}>
                                    <CircleFade  size={48} color="#393247" />
                                </View>
                            ) : (
                                <View style={styles.actionContainer}>
                                    <Button
                                        title="Enter App"
                                        type="gradient"
                                        size="large"
                                        onPress={handleNavigate}
                                        gradientDirection="diagonal"
                                        style={styles.enterButton}
                                    />
                                </View>
                            )}
                        </View>
                    <Text style={styles.developerName}>Developed by Haile Fikere</Text>
                </View>
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    backgroundImageStyle: {
        opacity: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    logo: {
        width: 280,
        height: 250,
        marginBottom: 30,
        
    },
    actionContainer: {
    height: 60, // Adjust this to match your button height
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
},
    loader: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: '#DDE6ED',
        borderTopColor: '#3498db',
        marginBottom: 20,
    },
    developerName: {
        position: 'absolute',
        bottom: 20, // Increased bottom margin to account for hidden navigation
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
    },
});

export default LandingPage;