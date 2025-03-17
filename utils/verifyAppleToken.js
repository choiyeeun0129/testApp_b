const jwt = require('jsonwebtoken');
const axios = require('axios');
const NodeRSA = require('node-rsa');

async function verifyAppleToken(identityToken) {
    try {
        console.log('🔍 1. Apple 토큰 검증 시작');
        
        const { data } = await axios.get('https://appleid.apple.com/auth/keys');
        console.log('🔍 2. Apple 공개 키 가져옴:', data.keys.length, '개');

        const decodedToken = jwt.decode(identityToken, { complete: true });
        console.log('🔍 3. 토큰 디코딩 완료:', decodedToken.header);

        const appleKey = data.keys.find((key) => key.kid === decodedToken.header.kid);
        console.log('🔍 4. 매칭된 Apple 키:', appleKey?.kid);

        const key = new NodeRSA();
        key.importKey({
            n: Buffer.from(appleKey.n, 'base64'),
            e: Buffer.from(appleKey.e, 'base64')
        }, 'components-public');
        console.log('🔍 5. RSA 키 생성 완료');

        const publicKey = key.exportKey('public');
        console.log('🔍 6. 공개키 추출 완료');

        const verifiedToken = jwt.verify(identityToken, publicKey, { algorithms: ['RS256'] });
        console.log('🔍 7. 토큰 검증 완료:', verifiedToken);

        return verifiedToken;
    } catch (error) {
        console.error('❌ Apple 토큰 검증 실패:', error);
        throw error;
    }
}

module.exports = verifyAppleToken;
