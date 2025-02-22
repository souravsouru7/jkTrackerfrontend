// ...existing imports...

const ProjectSection = ({ title, projects, onDelete, onSelect, selectedProject, status }) => (
  <div className={`bg-white/80 rounded-xl p-4 ${projects.length === 0 ? 'min-h-[200px]' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-[#7F5539]">{title}</h2>
      <span className="text-sm text-gray-500">{projects.length} projects</span>
    </div>
    {projects.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400">
        <div className="mb-2">No projects</div>
        <div className="text-sm">Projects will appear here when their status is {status}</div>
      </div>
    ) : (
      <div className="space-y-4">
        {projects.map((project) => (
          <motion.div
            key={project._id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-lg border ${
              selectedProject?._id === project._id
                ? "border-[#B08968] bg-[#B08968]/10"
                : "border-gray-100 bg-white"
            } hover:border-[#B08968]/50 transition-colors`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#7F5539]">{project.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelect(project)}
                    className="p-1 hover:bg-[#B08968]/10 rounded"
                  >
                    <ChevronRight size={16} className="text-[#B08968]" />
                  </button>
                  <button
                    onClick={() => onDelete(project._id)}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{project.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Budget: ${project.budget.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  // ...existing state...

  // Group projects by status
  const groupedProjects = useMemo(() => {
    const defaultGroups = {
      inProgress: [],
      progress: [],
      finished: []
    };
    
    if (!projects) return defaultGroups;
    
    return projects.reduce((acc, project) => {
      const status = project.status || 'inProgress';
      if (!acc[status]) acc[status] = [];
      acc[status].push(project);
      return acc;
    }, {...defaultGroups});
  }, [projects]);

  // Replace the existing projects section in the return statement with:
  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <Navbar />
      <div className="md:hidden h-14" />
      <div className="container mx-auto px-4 pt-4 pb-20 md:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ...existing financial summary section... */}

          {/* Project Creation Section */}
          <section className="hidden md:block bg-white/80 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Create Project</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project Name"
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#B08968]/20"
              />
              <input
                type="text"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Description"
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#B08968]/20"
              />
              <input
                type="number"
                value={newProjectBudget}
                onChange={(e) => setNewProjectBudget(e.target.value)}
                placeholder="Budget"
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#B08968]/20"
              />
              <button
                onClick={handleCreateProject}
                className="w-full py-3 bg-[#B08968] text-white rounded-lg"
              >
                Create Project
              </button>
            </div>
          </section>

          {/* Projects Grid */}
          <section className="bg-white/80 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Your Projects</h2>
            <ProjectList
              projects={projects}
              onDelete={handleDeleteProject}
              onSelect={handleSelectProject}
              selectedProject={selectedProject}
            />
          </section>

          {/* Project Details Section */}
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <FinancialSummary summary={balanceSummary} selectedProject={selectedProject} />
              <Charts
                monthlyExpenses={monthlyExpenses}
                incomeVsExpense={incomeVsExpense}
                categoryAnalysis={categoryAnalysis}
                colorPalette={colorPalette}
              />
            </motion.div>
          )}

          {/* ...existing floating button and modals... */}
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
