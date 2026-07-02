import { Router } from "express";
import { 
    changeCurrentPassword, 
    getUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateAvatar, 
    updateCoverImage 
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT,logoutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route('/changePassword').post(verifyJWT,changeCurrentPassword)

router.route('/get-user').get(verifyJWT,getUser)

router.route('/update-account').patch(verifyJWT,updateAccountDetails)

router.route('/update-avatar').patch(verifyJWT,
    upload.single("avatar"),
    updateAvatar
)

router.route('/update-cover-image').patch(verifyJWT,
    upload.single("coverImage"),
    updateCoverImage
)

router.route('/channel/:username').get(verifyJWT,getUserChannelProfile)

router.route('/history').get(verifyJWT,getWatchHistory)

export default router