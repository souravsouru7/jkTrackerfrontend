// EntryForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addEntry, updateEntry } from "../../store/slice/entrySlice";
import { fetchProjects } from "../../store/slice/projectSlice";
import { Plus, Mic, MicOff, AlertCircle, X, FileText } from "lucide-react";

// Entry Form Component
const EntryForm = ({ entry, onClose }) => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(
    (state) => state.projects.selectedProject
  );
  const projects = useSelector((state) => state.projects.projects);

  // Form State
  const [formData, setFormData] = useState(
    entry || {
      type: "Income",
      amount: "",
      category: "",
      description: "",
      projectId: selectedProject?._id || "",
      customCategory: "",
    }
  );

  // UI State
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // Add state for payment bill
  const [generateBill, setGenerateBill] = useState(false);

  // Category Options
  const categoryOptions = {
    Expense: [
      "Food",
      "Accommodation",
      "Carpenter",
      "Carpenter material",
      "Painter",
      "Paint material",
      "Fall ceiling",
      "Ceiling material",
      "Electrian",
      "Electrical material",
      "Jashwanth",
      "kushal",
      "JK",
      "Plumber",
      "Plumbing material",
      "Tiles",
      "Tiles material",
      "Glass",
      "Other",
    ],
    Income: ["Advance", "Payment", "Token", "Other"],
  };

  // Reset category and custom category when type changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      category: "",
      customCategory: "",
    }));
    setShowCustomCategory(false);
  }, [formData.type]);

  // Reset generateBill when type changes
  useEffect(() => {
    if (formData.type !== 'Income') {
      setGenerateBill(false);
    }
  }, [formData.type]);

  // Handle category change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category: value,
      customCategory: value === "Other" ? prev.customCategory : "",
    }));
    setShowCustomCategory(value === "Other");
  };

  // Handle custom category change
  const handleCustomCategoryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      customCategory: e.target.value,
      category: "Other",
    }));
  };

  // Initialize speech recognition and fetch projects
  useEffect(() => {
    // Fetch projects
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?._id || user?.id) {
      dispatch(fetchProjects(user?._id || user?.id));
    }

    // Initialize speech recognition
    if (window.webkitSpeechRecognition || window.SpeechRecognition) {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        setFeedback("Listening... Please speak now");
        setError("");
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        processVoiceInput(transcript);
        setFeedback("Voice input processed successfully!");
        setTimeout(() => setFeedback(""), 3000);
      };

      recognitionInstance.onerror = (event) => {
        setIsListening(false);
        switch (event.error) {
          case "no-speech":
            setError("No speech detected. Please try again.");
            break;
          case "audio-capture":
            setError("No microphone found. Please check your device.");
            break;
          case "not-allowed":
            setError("Microphone access denied. Please enable permissions.");
            break;
          case "network":
            setError("Network error occurred. Please check your connection.");
            break;
          default:
            setError(`Error: ${event.error}`);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (!error) {
          setFeedback("Listening stopped. Click the mic to try again.");
          setTimeout(() => setFeedback(""), 3000);
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [dispatch, error]);

  // Process voice input
  const processVoiceInput = (transcript) => {
    console.log("Processing transcript:", transcript);

    // Extract amount
    const amountMatch = transcript.match(/(\d+)/);
    if (amountMatch) {
      setFormData((prev) => ({ ...prev, amount: amountMatch[0] }));
    }

    // Determine type
    if (
      transcript.includes("income") ||
      transcript.includes("earn") ||
      transcript.includes("salary")
    ) {
      setFormData((prev) => ({ ...prev, type: "Income" }));
    } else if (
      transcript.includes("expense") ||
      transcript.includes("spend") ||
      transcript.includes("cost")
    ) {
      setFormData((prev) => ({ ...prev, type: "Expense" }));
    }

    // Find matching category
    const currentCategories = categoryOptions[formData.type];
    const foundCategory = currentCategories.find((category) =>
      transcript.toLowerCase().includes(category.toLowerCase())
    );
    if (foundCategory) {
      setFormData((prev) => ({ ...prev, category: foundCategory }));
    }

    // Extract description
    const description = transcript
      .replace(/(\d+)/, "")
      .replace(/(income|expense|earn|spend|cost)/, "")
      .replace(foundCategory || "", "")
      .trim();
    if (description) {
      setFormData((prev) => ({ ...prev, description }));
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      setError("Please select a project first");
      return;
    }

    try {
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);
      const userId = user?._id || user?.id;

      if (!userId) {
        setError("User ID not found. Please login again.");
        return;
      }

      if (!formData.projectId) {
        setError("Please select a project first");
        return;
      }

      const entryData = {
        type: formData.type,
        category: formData.category === "Other" ? formData.customCategory : formData.category,
        description: formData.description,
        projectId: selectedProject._id,
        userId: userId,
        amount: parseFloat(formData.amount),
        date: new Date().toISOString(),
        // Only include generateBill if type is Income and checkbox is checked
        ...(formData.type === 'Income' && { generateBill })
      };

      if (entry) {
        await dispatch(updateEntry({ id: entry._id, updates: entryData})).unwrap();
      } else {
        await dispatch(addEntry(entryData)).unwrap();
      }

      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to save entry");
      console.error("Error saving entry:", err);
    }
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Voice input toggle handler
  const toggleVoiceInput = () => {
    if (!recognition) {
      setError("Voice recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognition.stop();
      setFeedback("");
    } else {
      setError("");
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setError("Failed to start voice recognition. Please try again.");
        setIsListening(false);
      }
    }
  };

  // Class definitions for consistent styling
  const inputClasses =
    "w-full p-3 bg-white/80 border border-[#B08968]/30 rounded-lg text-[#7F5539] placeholder-[#B08968]/70 focus:ring-2 focus:ring-[#B08968] focus:border-transparent outline-none transition-all duration-300 hover:bg-white/90";
  const labelClasses = "block text-sm font-medium text-[#7F5539] mb-1.5";
  const selectClasses = `${inputClasses} appearance-none bg-no-repeat bg-right pr-10 cursor-pointer`;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-[#B08968]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 px-6 py-4 border-b border-[#B08968]/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-[#7F5539]">
              {entry ? "Update Entry" : "New Entry"}
            </h2>
            <p className="text-sm text-[#B08968]">Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#7F5539] hover:text-[#9C6644] transition-colors p-2 rounded-lg hover:bg-[#B08968]/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alerts */}
            {error && (
              <div className="bg-red-50/90 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}

            {feedback && !error && (
              <div className="bg-green-50/90 border border-green-200 rounded-lg p-4 flex gap-3 items-center">
                <Mic className="h-5 w-5 text-green-500" />
                <p className="text-green-700">{feedback}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project Select */}
              <div>
                <label className={labelClasses}>Project</label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  required
                  className={selectClasses}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Select */}
              <div>
                <label className={labelClasses}>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={selectClasses}
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className={labelClasses}>Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9C6644] font-medium">
                    Rs
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className={`${inputClasses} pl-10`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    required
                    className={selectClasses}
                  >
                    <option value="">Select a category</option>
                    {categoryOptions[formData.type].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Category Input */}
                {showCustomCategory && (
                  <div>
                    <label className={labelClasses}>Custom Category</label>
                    <input
                      type="text"
                      value={formData.customCategory}
                      onChange={handleCustomCategoryChange}
                      className={inputClasses}
                      placeholder={`Enter custom ${formData.type.toLowerCase()} category...`}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Description Input */}
              <div className="sm:col-span-2">
                <label className={labelClasses}>Description</label>
                <div className="relative">
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={inputClasses}
                    placeholder="Add a description..."
                  />
                </div>
              </div>

              {/* Only show Payment Bill Generation Option for Income entries */}
              {formData.type === 'Income' && (
                <div className="sm:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generateBill}
                      onChange={(e) => setGenerateBill(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-[#B08968] rounded border-[#B08968]/30 focus:ring-[#B08968]"
                    />
                    <span className="text-[#7F5539] flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Generate Payment Bill
                    </span>
                  </label>
                  <p className="text-sm text-[#B08968] mt-1 ml-8">
                    A PDF payment bill will be generated and downloaded automatically
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 px-6 py-4 border-t border-[#B08968]/10">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 group flex items-center justify-center gap-2 bg-[#B08968] hover:bg-[#9C6644] text-white px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg"
            >
              <Plus
                size={18}
                className="transform group-hover:rotate-180 transition-transform duration-300"
              />
              <span className="font-medium">
                {entry ? "Update Entry" : "Save Entry"}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/50 text-[#7F5539] px-6 py-2.5 rounded-lg hover:bg-white/70 transition-all duration-300 hover:shadow-md border border-[#B08968]/20"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;