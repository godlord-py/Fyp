"use client"

import { useState } from "react"
import {
  Printer,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Code,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"

const ResumeBuilder = () => {
  const [selectedTheme, setSelectedTheme] = useState("blue")
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      github: "",
      linkedin: "",
    },
    summary: "",
    workExperience: [],
    education: [],
    projects: [],
    certifications: [],
    skills: [],
  })

  const [newSkill, setNewSkill] = useState("")

  const themes = {
    blue: {
      primary: "blue-600",
      primaryLight: "blue-50",
      primaryBorder: "blue-200",
      primaryText: "blue-700",
    },
    black: {
      primary: "gray-800",
      primaryLight: "gray-50",
      primaryBorder: "gray-300",
      primaryText: "gray-800",
    },
    green: {
      primary: "green-600",
      primaryLight: "green-50",
      primaryBorder: "green-200",
      primaryText: "green-700",
    },
    purple: {
      primary: "purple-600",
      primaryLight: "purple-50",
      primaryBorder: "purple-200",
      primaryText: "purple-700",
    },
    red: {
      primary: "red-600",
      primaryLight: "red-50",
      primaryBorder: "red-200",
      primaryText: "red-700",
    },
    indigo: {
      primary: "indigo-600",
      primaryLight: "indigo-50",
      primaryBorder: "indigo-200",
      primaryText: "indigo-700",
    },
  }

  const currentTheme = themes[selectedTheme]

  const updatePersonalInfo = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }))
  }

  const updateSummary = (value) => {
    setResumeData((prev) => ({
      ...prev,
      summary: value,
    }))
  }

  const updateWorkExperience = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }))
  }

  const addWorkExperience = () => {
    const newId = Math.max(...resumeData.workExperience.map((exp) => exp.id), 0) + 1
    setResumeData((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          id: newId,
          jobTitle: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }))
  }

  const removeWorkExperience = (id) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((exp) => exp.id !== id),
    }))
  }

  const updateEducation = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }))
  }

  const addEducation = () => {
    const newId = Math.max(...resumeData.education.map((edu) => edu.id), 0) + 1
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: newId,
          degree: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
          gpa: "",
        },
      ],
    }))
  }

  const removeEducation = (id) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }

  const updateProject = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => (project.id === id ? { ...project, [field]: value } : project)),
    }))
  }

  const addProject = () => {
    const newId = Math.max(...resumeData.projects.map((project) => project.id), 0) + 1
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: newId,
          title: "",
          technologies: "",
          startDate: "",
          endDate: "",
          description: "",
          link: "",
        },
      ],
    }))
  }

  const removeProject = (id) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
    }))
  }

  const updateCertification = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    }))
  }

  const addCertification = () => {
    const newId = Math.max(...resumeData.certifications.map((cert) => cert.id), 0) + 1
    setResumeData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: newId,
          name: "",
          issuer: "",
          issueDate: "",
          expiryDate: "",
          credentialId: "",
        },
      ],
    }))
  }

  const removeCertification = (id) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handlePrint = () => {
    alert("For best results, disable 'Headers and Footers' in print settings and set to 1 page.")
    window.print()
  }

  return (
    <div>
      {/* Print-only CSS styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #resume-preview-only,
          #resume-preview-only * {
            visibility: visible;
          }

          #resume-preview-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15px;
            box-sizing: border-box;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }

          #resume-preview-only {
            font-size: 10pt;
            line-height: 1.3;
            font-family: Arial, sans-serif;
          }

          #resume-preview-only h1 {
            font-size: 14pt;
            margin-bottom: 8px;
          }

          #resume-preview-only h2 {
            font-size: 11pt;
            margin-top: 12px;
            margin-bottom: 6px;
          }

          #resume-preview-only h3 {
            font-size: 10pt;
            margin-bottom: 4px;
          }

          #resume-preview-only .skill-tag {
            border: 1px solid #ccc !important;
            background: #f5f5f5 !important;
            color: #333 !important;
            font-size: 9pt;
          }

          #resume-preview-only {
            page-break-inside: avoid;
          }

          #resume-preview-only .section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }

        @page {
          margin: 0.5in;
          size: A4;
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Resume Builder</h1>

              {/* Theme Selector */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">🎨 Theme</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(themes).map((themeName) => (
                    <button
                      key={themeName}
                      onClick={() => setSelectedTheme(themeName)}
                      className={`px-3 py-2 rounded capitalize font-medium transition-all ${
                        selectedTheme === themeName
                          ? `bg-${themes[themeName].primary} text-white`
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {themeName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={resumeData.personalInfo.name}
                    onChange={(e) => updatePersonalInfo("name", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo("location", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="GitHub"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => updatePersonalInfo("github", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Professional Summary
                </h2>
                <textarea
                  placeholder="Write a brief professional summary (2-3 sentences)"
                  value={resumeData.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Work Experience */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Work Experience
                </h2>
                {resumeData.workExperience.map((exp) => (
                  <div key={exp.id} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={exp.jobTitle}
                        onChange={(e) => updateWorkExperience(exp.id, "jobTitle", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(exp.id, "company", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={exp.location}
                        onChange={(e) => updateWorkExperience(exp.id, "location", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="month"
                          placeholder="Start Date"
                          value={exp.startDate}
                          onChange={(e) => updateWorkExperience(exp.id, "startDate", e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="month"
                          placeholder="End Date"
                          value={exp.endDate}
                          onChange={(e) => updateWorkExperience(exp.id, "endDate", e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <textarea
                      placeholder="Job Description"
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(exp.id, "description", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    {resumeData.workExperience.length > 1 && (
                      <button
                        onClick={() => removeWorkExperience(exp.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addWorkExperience}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Work Experience
                </button>
              </div>

              {/* Projects */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Projects
                </h2>
                {resumeData.projects.map((project) => (
                  <div key={project.id} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Project Title"
                        value={project.title}
                        onChange={(e) => updateProject(project.id, "title", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Technologies Used"
                        value={project.technologies}
                        onChange={(e) => updateProject(project.id, "technologies", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="month"
                          placeholder="Start Date"
                          value={project.startDate}
                          onChange={(e) => updateProject(project.id, "startDate", e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="month"
                          placeholder="End Date"
                          value={project.endDate}
                          onChange={(e) => updateProject(project.id, "endDate", e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <input
                        type="url"
                        placeholder="Project Link"
                        value={project.link}
                        onChange={(e) => updateProject(project.id, "link", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:col-span-2"
                      />
                    </div>
                    <textarea
                      placeholder="Project Description"
                      value={project.description}
                      onChange={(e) => updateProject(project.id, "description", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    {resumeData.projects.length > 1 && (
                      <button
                        onClick={() => removeProject(project.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addProject}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Project
                </button>
              </div>

              {/* Education */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Education
                </h2>
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={edu.location}
                        onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="GPA/Grade"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Start Year"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="End Year"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    {resumeData.education.length > 1 && (
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Education
                </button>
              </div>

              {/* Certifications */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Certifications
                </h2>
                {resumeData.certifications.map((cert) => (
                  <div key={cert.id} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Certification Name"
                        value={cert.name}
                        onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Issuing Organization"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="month"
                        placeholder="Issue Date"
                        value={cert.issueDate}
                        onChange={(e) => updateCertification(cert.id, "issueDate", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="month"
                        placeholder="Expiry Date (Optional)"
                        value={cert.expiryDate}
                        onChange={(e) => updateCertification(cert.id, "expiryDate", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Credential ID (Optional)"
                        value={cert.credentialId}
                        onChange={(e) => updateCertification(cert.id, "credentialId", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:col-span-2"
                      />
                    </div>
                    {resumeData.certifications.length > 1 && (
                      <button
                        onClick={() => removeCertification(cert.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addCertification}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Certification
                </button>
              </div>

              {/* Skills */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Skills
                </h2>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-700 hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Resume Preview */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-700">Resume Preview</h2>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print/Save PDF
                </button>
              </div>

              {/* This is the resume preview that will be printed */}
              <div id="resume-preview-only" className="bg-white p-6 border-2 border-black rounded-lg text-sm">
                {/* Header */}
                <div className="section text-center border-b-2 border-gray-300 pb-3 mb-4">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {resumeData.personalInfo.name || "Your Name"}
                  </h1>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-4 text-xs text-gray-600 flex-wrap">
                      <span className="flex gap-2 items-center">
                        <Mail className="w-4 h-4 text-blue-600" />
                        {resumeData.personalInfo.email || "your.email@example.com"}
                      </span>
                      <span className="flex gap-2 items-center">
                        <Phone className="w-4 h-4 text-blue-600" />
                        {resumeData.personalInfo.phone || "Your Phone"}
                      </span>
                      <span className="flex gap-2 items-center">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {resumeData.personalInfo.location || "Your Location"}
                      </span>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-gray-600 flex-wrap">
                      {resumeData.personalInfo.github && (
                        <a
                          href={resumeData.personalInfo.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex gap-2 items-center hover:text-blue-600"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </a>
                      )}
                      {resumeData.personalInfo.linkedin && (
                        <a
                          href={resumeData.personalInfo.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex gap-2 items-center hover:text-blue-600"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                {resumeData.summary && (
                  <div className="section mb-4">
                    <h2 className="text-sm font-bold text-blue-700 border-b border-blue-200 pb-1 mb-2">
                      PROFESSIONAL SUMMARY
                    </h2>
                    <p className="text-gray-700 text-xs leading-relaxed">{resumeData.summary}</p>
                  </div>
                )}

                {/* Work Experience */}
                {resumeData.workExperience.length > 0 && (
                  <div className="section mb-4">
                    <h2 className="text-sm font-bold text-blue-700 border-b border-blue-200 pb-1 mb-2">
                      WORK EXPERIENCE
                    </h2>
                    {resumeData.workExperience.map((exp) => {
                      if (!exp.jobTitle && !exp.company) return null
                      return (
                        <div key={exp.id} className="mb-3">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="font-bold text-gray-800 text-xs">{exp.jobTitle || "Job Title"}</h3>
                              <p className="font-semibold text-gray-700 text-xs">{exp.company || "Company Name"}</p>
                            </div>
                            <div className="text-right text-xs text-gray-600">
                              <p>{exp.location}</p>
                              <p>
                                {exp.startDate} - {exp.endDate || "Present"}
                              </p>
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-gray-700 text-xs leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects.length > 0 && (
                  <div className="section mb-4">
                    <h2 className="text-sm font-bold text-blue-700 border-b border-blue-200 pb-1 mb-2">PROJECTS</h2>
                    {resumeData.projects.map((project) => {
                      if (!project.title) return null
                      return (
                        <div key={project.id} className="mb-3">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="font-bold text-gray-800 text-xs">{project.title}</h3>
                              {project.technologies && (
                                <p className="text-gray-600 text-xs">
                                  <strong>Tech:</strong> {project.technologies}
                                </p>
                              )}
                              {project.link && <p className="text-blue-600 text-xs">{project.link}</p>}
                            </div>
                            <div className="text-right text-xs text-gray-600">
                              <p>
                                {project.startDate} - {project.endDate || "Present"}
                              </p>
                            </div>
                          </div>
                          {project.description && (
                            <p className="text-gray-700 text-xs leading-relaxed">{project.description}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div className="section mb-4">
                    <h2 className="text-sm font-bold text-blue-700 border-b border-blue-200 pb-1 mb-2">EDUCATION</h2>
                    {resumeData.education.map((edu) => {
                      if (!edu.degree && !edu.institution) return null
                      return (
                        <div key={edu.id} className="mb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-800 text-xs">{edu.degree || "Degree"}</h3>
                              <p className="font-semibold text-gray-700 text-xs">{edu.institution || "Institution"}</p>
                              {edu.gpa && <p className="text-gray-600 text-xs">GPA: {edu.gpa}</p>}
                            </div>
                            <div className="text-right text-xs text-gray-600">
                              <p>{edu.location}</p>
                              <p>
                                {edu.startDate} - {edu.endDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Certifications */}
                {resumeData.certifications.length > 0 && (
                  <div className="section mb-4">
                    <h2 className="text-sm font-bold text-blue-700 border-b border-blue-200 pb-1 mb-2">
                      CERTIFICATIONS
                    </h2>
                    {resumeData.certifications.map((cert) => {
                      if (!cert.name) return null
                      return (
                        <div key={cert.id} className="mb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-800 text-xs">{cert.name}</h3>
                              <p className="font-semibold text-gray-700 text-xs">{cert.issuer}</p>
                              {cert.credentialId && <p className="text-gray-600 text-xs">ID: {cert.credentialId}</p>}
                            </div>
                            <div className="text-right text-xs text-gray-600">
                              <p>Issued: {cert.issueDate}</p>
                              {cert.expiryDate && <p>Expires: {cert.expiryDate}</p>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills.length > 0 && (
                  <div className="section mb-4">
                    <h2 className="text-sm font-bold text-blue-700 border-b border-blue-200 pb-1 mb-2">SKILLS</h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="skill-tag px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder
