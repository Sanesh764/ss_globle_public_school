import express from 'express';
import { getHeroSlides } from '../controllers/hero.controller.js';

const router = express.Router();

router.get('/', getHeroSlides);

export default router;
