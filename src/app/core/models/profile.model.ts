import { EducationStage } from '../constants/roles.enum';

export interface Profile {
  id: string;
  fullName: string | null;
  username: string | null;
  educationStage: EducationStage | null;
  grade: number | null;
  subjects: string[] | null;
  institution: string | null;
  course: string | null;
  createdAt: string;
}
