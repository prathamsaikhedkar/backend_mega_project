import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'

const generateAccessRefreshTokens = async(userId) => {
    try {
        const user = await User.findOne(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, error.message)
    }
}

const registerUser = asyncHandler(async (req,res) => {
    // get user details
    // validation 
    // check if user already exists
    // check if avatar image is there
    // upload image to cloudinary, 
    // check if image is properly uploaded
    // create user object - create entry in db
    // remove password and refreshtoken from response
    // check for user creation in db
    // return response

    const {fullName,email,username,password} = req.body
    // console.log(fullName,email,username,password);

    if (
        [fullName,email,username,password].some((field) => (
            field?.trim() === ""
        ))
    ) {
        throw new ApiError(400,"one of the fields is missing")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if (existedUser) throw new ApiError(409,"User already exists")

    // const avatarPath = req.files?.avatar[0]?.path
    // const coverImagePath = req.files?.coverImage[0]?.path

    let avatarPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarPath = req.files.avatar[0].path
    }
    let coverImagePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagePath = req.files.coverImage[0].path
    }

    if (!avatarPath) {
        throw new ApiError(400,"avatar required")
    }

    const avatar = await uploadOnCloudinary(avatarPath)
    const coverImage = await uploadOnCloudinary(coverImagePath) 

    if (!avatar) throw new ApiError(500,"avatar not uploaded")

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password
        
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) throw new ApiError(500,"user not found in database while registering")

    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "user registered successfully"
        )
    )


})


const loginUser = asyncHandler(async(req,res) => {
    // get user details
    // validation
    // check if user exists
    // password check
    // generate access refresh token
    // send cookie
    // successful login response

    const {email, username, password} = req.body

    if (!email && !username) {
        throw new ApiError(400, "username or email is required")
    }

    if (!password) throw new ApiError(400, "Password is required")

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if (!user) throw new ApiError(404, "User not registered")

    if (!(await user.isPasswordCorrect(password))) throw new ApiError(401, "password incorrect")

    const {accessToken,refreshToken} = await generateAccessRefreshTokens(user._id)

    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        200,
        {
            user: loggedInUser,
            accessToken,
            refreshToken
        },
        "User logged in saksesfully"
    ))

    

    
})

const logoutUser = asyncHandler(async(req,res) => {
    const userId = req.user._id

    const user = await User.findByIdAndUpdate(userId, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new ApiResponse(
            200,
            {},
            "User logged out"
        )
    )


})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!refreshToken) throw new ApiError(400,"refresh token not provided")

    try {
        const decodedToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)?.select("-password")
    
    
        if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(403, "wrong refresh token noob")
        }
    
        const {newAccessToken,newRefreshToken} = await generateAccessRefreshTokens(decodedToken._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res.status(200).cookie("accessToken",newAccessToken,options).cookie("refreshToken",newRefreshToken,options).json(
            new ApiResponse(
                200,
                {newAccessToken,newRefreshToken},
                "new access token generated saksefully"
            )
        )
    } catch (error) {
        throw new ApiError(500, "idk what happened: "+error.message)
    }


    
})

export {registerUser, loginUser, logoutUser, refreshAccessToken}