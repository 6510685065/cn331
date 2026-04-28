import { useState } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import {
  FileText,
  Eye,
  Download,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Globe,
  GraduationCap,
  Briefcase,
  Code,
  User as UserIcon
} from 'lucide-react';

interface ResumeViewProps {
  currentUser: User;
}

type TabType = 'display' | 'bio' | 'education' | 'experience' | 'skills';

export function ResumeView({ currentUser }: ResumeViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('display');
  const [isEditing, setIsEditing] = useState(false);

  // Mock resume data populated with currentUser where available
  const [resumeData] = useState({
    name: currentUser.name || 'ไม่ระบุชื่อ',
    title: currentUser.role === 'STUDENT' 
      ? `นักศึกษา${currentUser.faculty ? `คณะ${currentUser.faculty}` : ''}`
      : currentUser.role === 'PROFESSOR' ? 'อาจารย์' : 'บุคลากร',
    email: currentUser.email,
    phone: '089-xxx-xxxx',
    location: 'กรุงเทพมหานคร ประเทศไทย',
    website: 'your-portfolio.com',
    bio: currentUser.role === 'STUDENT' 
      ? 'นักศึกษามหาวิทยาลัยธรรมศาสตร์ มีความสนใจในการเรียนรู้และพัฒนาตนเอง พร้อมที่จะเผชิญกับความท้าทายใหม่ ๆ'
      : 'บุคลากรมหาวิทยาลัยธรรมศาสตร์',
    education: [
      {
        id: '1',
        degree: 'ปริญญาตรี วิทยาศาสตร์คอมพิวเตอร์',
        institution: 'มหาวิทยาลัย XYZ',
        period: '2565 - 2568 (คาดว่าจะจบการศึกษา)',
        gpa: '3.45 / 4.00'
      }
    ],
    experience: [
      {
        id: '1',
        title: 'Web Developer Intern',
        company: 'บริษัท ABC Technology',
        period: 'ม.ค. 2025 - ส.ค. 2025',
        description: [
          'พัฒนาเว็บแอปพลิเคชันด้วย React และ Node.js',
          'ทำงานร่วมกับทีมในการออกแบบและพัฒนา features ใหม่',
          'เรียนรู้และใช้งาน Git, Docker, และ CI/CD'
        ]
      },
      {
        id: '2',
        title: 'หัวหน้าชมรมคอมพิวเตอร์',
        company: 'มหาวิทยาลัย XYZ',
        period: 'ม.ค. 2025 - ปัจจุบัน',
        description: [
          'บริหารจัดการชมรมและจัดกิจกรรมต่างๆ',
          'ประสานงานกับสมาชิกและหน่วยงานภายในมหาวิทยาลัย'
        ]
      }
    ],
    skills: {
      programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'],
      frameworks: ['React', 'Node.js', 'Express', 'Next.js', 'Tailwind CSS'],
      tools: ['Git', 'Docker', 'PostgreSQL', 'MongoDB', 'Figma'],
      softSkills: ['ทำงานเป็นทีม', 'การสื่อสาร', 'แก้ปัญหา', 'บริหารเวลา']
    }
  });

  const tabs = [
    { id: 'display', label: 'Display', icon: Eye },
    { id: 'bio', label: 'Bio', icon: UserIcon },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Code }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'display':
        return <DisplayTab resumeData={resumeData} isEditing={isEditing} />;
      case 'bio':
        return <BioTab bio={resumeData.bio} isEditing={isEditing} />;
      case 'education':
        return <EducationTab education={resumeData.education} isEditing={isEditing} />;
      case 'experience':
        return <ExperienceTab experience={resumeData.experience} isEditing={isEditing} />;
      case 'skills':
        return <SkillsTab skills={resumeData.skills} isEditing={isEditing} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold">Resume</h1>
          </div>
          <p className="text-muted-foreground">จัดการและแสดงประวัติส่วนตัวของคุณ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
            <Eye className="w-4 h-4 mr-2" />
            ดูตัวอย่าง
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
            <Download className="w-4 h-4 mr-2" />
            ดาวน์โหลด PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600 font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}

// Display Tab Component
function DisplayTab({ resumeData, isEditing }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">ข้อมูลส่วนตัว</CardTitle>
          <Button variant="ghost" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            แก้ไข
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              SC
            </div>

            {/* Personal Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{resumeData.name}</h2>
                <p className="text-muted-foreground">{resumeData.title}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{resumeData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{resumeData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{resumeData.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>{resumeData.website}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">เกี่ยวกับฉัน</CardTitle>
          <Button variant="ghost" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            แก้ไข
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{resumeData.bio}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Bio Tab Component
function BioTab({ bio, isEditing }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ประวัติส่วนตัว</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea className="min-h-[200px]" defaultValue={bio} />
        ) : (
          <p className="text-muted-foreground leading-relaxed">{bio}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Education Tab Component
function EducationTab({ education, isEditing }: any) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-red-600" />
            </div>
            <CardTitle>การศึกษา</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            แก้ไข
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.map((edu: any) => (
            <div key={edu.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{edu.degree}</h3>
                  <p className="text-muted-foreground">{edu.institution}</p>
                  <p className="text-sm text-muted-foreground">{edu.period}</p>
                  <p className="text-sm font-medium mt-1">GPA: {edu.gpa}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Experience Tab Component
function ExperienceTab({ experience, isEditing }: any) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-amber-600" />
            </div>
            <CardTitle>ประสบการณ์</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            แก้ไข
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {experience.map((exp: any, index: number) => (
            <div key={exp.id}>
              {index > 0 && <Separator className="my-6" />}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{exp.title}</h3>
                  <p className="text-muted-foreground">{exp.company}</p>
                  <p className="text-sm text-muted-foreground mb-3">{exp.period}</p>
                  <ul className="space-y-1 text-sm">
                    {exp.description.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Skills Tab Component
function SkillsTab({ skills, isEditing }: any) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Code className="w-5 h-5 text-red-600" />
            </div>
            <CardTitle>ทักษะ</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            แก้ไข
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Programming Languages */}
          <div className="space-y-3">
            <h3 className="font-semibold">Programming Languages</h3>
            <div className="flex flex-wrap gap-2">
              {skills.programmingLanguages.map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Frameworks & Libraries */}
          <div className="space-y-3">
            <h3 className="font-semibold">Frameworks & Libraries</h3>
            <div className="flex flex-wrap gap-2">
              {skills.frameworks.map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tools & Technologies */}
          <div className="space-y-3">
            <h3 className="font-semibold">Tools & Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {skills.tools.map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Soft Skills */}
          <div className="space-y-3">
            <h3 className="font-semibold">Soft Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.softSkills.map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}