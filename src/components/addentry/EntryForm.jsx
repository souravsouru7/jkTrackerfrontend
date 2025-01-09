import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEntry, updateEntry } from '../../store/slice/entrySlice';
import { fetchProjects } from '../../store/slice/projectSlice';
import { Plus, Mic, MicOff } from 'lucide-react';

const EntryForm = ({ entry, onClose }) => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(state => state.projects.selectedProject);
  const projects = useSelector(state => state.projects.projects);
  const [formData, setFormData] = useState(
    entry || { 
      type: 'Income', 
      amount: '', 
      category: '', 
      description: '',
      projectId: selectedProject?._id || ''
    }
  );
  
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?._id || user?.id) {
      dispatch(fetchProjects(user?._id || user?.id));
    }

    // Initialize speech recognition
    if (window.webkitSpeechRecognition || window.SpeechRecognition) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        setFeedback('Listening... Please speak now');
        setError('');
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        processVoiceInput(transcript);
        setFeedback('Voice input processed successfully!');
        setTimeout(() => setFeedback(''), 3000);
      };

      recognitionInstance.onerror = (event) => {
        setIsListening(false);
        switch (event.error) {
          case 'no-speech':
            setError('No speech was detected. Please try again and speak clearly.');
            break;
          case 'audio-capture':
            setError('No microphone was found. Ensure it is connected and permitted.');
            break;
          case 'not-allowed':
            setError('Microphone permission was denied. Please allow microphone access.');
            break;
          case 'network':
            setError('Network error occurred. Please check your connection.');
            break;
          default:
            setError(`Error: ${event.error}`);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (!error) {
          setFeedback('Listening stopped. Click the mic button to try again.');
          setTimeout(() => setFeedback(''), 3000);
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [dispatch, error]);

  const processVoiceInput = (transcript) => {
    console.log('Processing transcript:', transcript);

    // Parse amount
    const amountMatch = transcript.match(/(\d+)/);
    if (amountMatch) {
      setFormData(prev => ({ ...prev, amount: amountMatch[0] }));
    }

    // Determine type
    if (transcript.includes('income') || transcript.includes('earn') || transcript.includes('salary')) {
      setFormData(prev => ({ ...prev, type: 'Income' }));
    } else if (transcript.includes('expense') || transcript.includes('spend') || transcript.includes('cost')) {
      setFormData(prev => ({ ...prev, type: 'Expense' }));
    }

    // Parse category
    const commonCategories = [
      'salary', 'rent', 'groceries', 'utilities', 'food', 
      'transport', 'medical', 'entertainment', 'shopping',
      'bills', 'maintenance', 'internet', 'phone'
    ];
    const foundCategory = commonCategories.find(category => 
      transcript.includes(category)
    );
    if (foundCategory) {
      setFormData(prev => ({ ...prev, category: foundCategory }));
    }

    // Use remaining text as description
    const description = transcript
      .replace(/(\d+)/, '')
      .replace(/(income|expense|earn|spend|cost)/, '')
      .replace(foundCategory || '', '')
      .trim();
    if (description) {
      setFormData(prev => ({ ...prev, description }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      const userId = user?._id || user?.id;
      
      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      if (!formData.projectId) {
        setError('Please select a project first');
        return;
      }

      const entryData = {
        ...formData,
        projectId: selectedProject._id,
        userId: user?._id || user?.id,
        amount: parseFloat(formData.amount),
        date: new Date().toISOString()
      };

      if (entry) {
        await dispatch(updateEntry({ id: entry._id, updates: entryData })).unwrap();
      } else {
        await dispatch(addEntry(entryData)).unwrap();
      }

      onClose && onClose();
    } catch (err) {
      setError(err.message || 'Failed to save entry');
      console.error('Error saving entry:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleVoiceInput = () => {
    if (!recognition) {
      setError('Voice recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setFeedback('');
    } else {
      setError('');
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setError('Failed to start voice recognition. Please try again.');
        setIsListening(false);
      }
    }
  };

  const inputClasses = "w-full p-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] placeholder-[#B08968] focus:ring-2 focus:ring-[#B08968] focus:border-[#B08968] transition-all duration-200";
  const labelClasses = "block text-sm font-medium text-[#7F5539] mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#7F5539]">
          {entry ? 'Update Entry' : 'New Entry'}
        </h2>
        <div className="flex items-center gap-4">
          {isListening && (
            <span className="text-sm text-green-600 animate-pulse">
              🎤 Listening...
            </span>
          )}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-3 rounded-full transition-all duration-300 hover:scale-105 ${
              isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-[#B08968] text-white'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {feedback && !error && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {feedback}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Project</label>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleInputChange}
            required
            className={inputClasses}
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={inputClasses}
          >
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9C6644]">Rs</span>
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

        <div>
          <label className={labelClasses}>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className={inputClasses}
            placeholder="e.g., Salary"
          />
        </div>

        <div>
          <label className={labelClasses}>Description</label>
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

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          className="flex-1 group flex items-center justify-center gap-2 bg-[#B08968] hover:bg-[#9C6644] text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
        >
          <Plus size={20} className="transform group-hover:rotate-180 transition-transform duration-300" />
          <span>{entry ? 'Update Entry' : 'Save Entry'}</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-white/50 text-[#7F5539] px-6 py-3 rounded-lg hover:bg-white/70 transition-all duration-300 hover:scale-105 border border-[#B08968]/20"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EntryForm;