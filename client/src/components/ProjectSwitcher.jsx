import React from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const ProjectSwitcher = () => {
  const { projects, selectedProject, setSelectedProject } = useProjects();
  const { t } = useLanguage();

  if (projects.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('no_projects_yet')}{' '}
        <Link to="/projects" className="font-medium text-primary-600 hover:underline">
          {t('create_first_project')}
        </Link>
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">{t('project_label')}</span>
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
      >
        {projects.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProjectSwitcher;
