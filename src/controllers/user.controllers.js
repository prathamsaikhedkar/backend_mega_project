import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'

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

    const existedUser = User.findOne({
        $or: [{username},{email}]
    })

    if (existedUser) throw new ApiError(409,"User already exists")

    const avatarPath = req.files?.avatar[0]?.path
    const coverImagePath = req.files?.coverImage[0]?.path

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

export {registerUser}