import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { profileService } from '../services/profileService';

export const profileController = {
  // GET /profile
  getProfile: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const profile = await profileService.getFullProfile(userId);
    res.status(200).json({ success: true, data: profile });
  }),

  // PATCH /profile
  updateProfile: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const {
      name,
      bio,
      location,
      education,
      avatar,
      githubUrl,
      linkedinUrl,
      githubConnected,
      linkedinConnected,
    } = req.body;

    const updates: any[] = [];

    if (name) {
      updates.push(profileService.updateUserName(userId, name));
    }

    const profileData: any = {};
    if (bio !== undefined) profileData.bio = bio;
    if (location !== undefined) profileData.location = location;
    if (education !== undefined) profileData.education = education;
    if (avatar !== undefined) profileData.avatar = avatar;
    if (githubUrl !== undefined) profileData.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) profileData.linkedinUrl = linkedinUrl;
    if (githubConnected !== undefined) profileData.githubConnected = githubConnected;
    if (linkedinConnected !== undefined) profileData.linkedinConnected = linkedinConnected;

    if (Object.keys(profileData).length > 0) {
      updates.push(profileService.upsertProfile(userId, profileData));
    }

    await Promise.all(updates);

    const updated = await profileService.getFullProfile(userId);
    res.status(200).json({ success: true, data: updated });
  }),
};
