/**
 * Created by alex on 4/10/16.
 */

module.exports = {
        'facebookAuth': {
           'clientID': '718205708322170', // your App ID
                'clientSecret': 'bed887595e7eab2ec9a37fa44e35f90d', // your App Secret
                'callbackURL': '/auth/facebook/callback',
                'proxy': process.env.NODE_ENV === 'production'
        },
    'twitterAuth': {
            'consumerKey': 'cRgoBp4d3rMie80LhiauWtmDS',
                'consumerSecret': 'QhBA7HNNVYnz1zgzqbEvm1izSj5E3uJI0CU3btFBHdcSpUR096',
                'callbackURL': '/auth/twitter/callback',
                'proxy': process.env.NODE_ENV === 'production'
        },
    'googleAuth': {
           'clientID': '863247138013-23phfl217jvsea5t4ttnlocvp6p2eopi.apps.googleusercontent.com',
                'clientSecret': 'MEpzZoGb1kdN7WQtLnj4Jhi7',
                'callbackURL': '/auth/google/callback',
                'proxy': process.env.NODE_ENV === 'production'
        }
};