import React from 'react';
import {Dimensions, View, ActivityIndicator } from 'react-native';
import Dialog, { SlideAnimation, DialogContent, DialogTitle } from 'react-native-popup-dialog'

const functons = {

    loading(statusVisible) {
        const { height } = Dimensions.get('window');

        return (
            <View style={{ flex: 1, alignItems: 'center' }}>
                {/* <ActivityIndicator size="large" color='green' style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} /> */}
                <Dialog
                    width={Dimensions.get('window').width}
                    visible={statusVisible}
                    dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
                    dialogStyle={{backgroundColor:'transparent', position: 'absolute',alignItems:'center',alignItems:'center' }}
                >
                    <DialogContent>
                        <View style={{ height: 100, marginTop: 30 }}>
                            <ActivityIndicator size="large" color='#c2306d' style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
                        </View>
                    </DialogContent>
                </Dialog>
            </View>

        )
    }
}

export default functons
