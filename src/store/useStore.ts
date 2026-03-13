import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Property,
  Project,
  Person,
  FinancialEntry,
  Scenario,
  ViewType,
  Task,
} from '../types';

interface StoreState {
  // Data
  properties: Property[];
  projects: Project[];
  people: Person[];
  finances: FinancialEntry[];
  scenarios: Scenario[];

  // UI
  currentView: ViewType;
  selectedPropertyId: string | null;
  selectedProjectId: string | null;
  showAddPropertyModal: boolean;
  showProjectModal: boolean;

  // View actions
  setCurrentView: (view: ViewType) => void;
  setSelectedPropertyId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  setShowAddPropertyModal: (show: boolean) => void;
  setShowProjectModal: (show: boolean) => void;

  // Property CRUD
  addProperty: (property: Omit<Property, 'id' | 'projects'>) => string;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // Project CRUD
  addProject: (project: Omit<Project, 'id'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateProjectStatus: (id: string, status: Project['status']) => void;
  addTaskToProject: (projectId: string, task: Omit<Task, 'id'>) => void;
  toggleTask: (projectId: string, taskId: string) => void;

  // People CRUD
  addPerson: (person: Omit<Person, 'id'>) => string;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;

  // Finance CRUD
  addFinance: (entry: Omit<FinancialEntry, 'id'>) => string;
  updateFinance: (id: string, updates: Partial<FinancialEntry>) => void;
  deleteFinance: (id: string) => void;

  // Scenario CRUD
  addScenario: (scenario: Omit<Scenario, 'id'>) => string;
  updateScenario: (id: string, updates: Partial<Scenario>) => void;
  deleteScenario: (id: string) => void;

  // Data management
  exportData: () => string;
  importData: (json: string) => void;
  loadSampleData: () => void;

}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      properties: [],
      projects: [],
      people: [],
      finances: [],
      scenarios: [],

      currentView: 'board',
      selectedPropertyId: null,
      selectedProjectId: null,
      showAddPropertyModal: false,
      showProjectModal: false,

      // View actions
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      setShowAddPropertyModal: (show) => set({ showAddPropertyModal: show }),
      setShowProjectModal: (show) => set({ showProjectModal: show }),

      // Property CRUD
      addProperty: (property) => {
        const id = uuidv4();
        set((state) => ({
          properties: [...state.properties, { ...property, id, projects: [] }],
        }));
        return id;
      },
      updateProperty: (id, updates) =>
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deleteProperty: (id) =>
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
          projects: state.projects.filter((p) => p.propertyId !== id),
        })),

      // Project CRUD
      addProject: (project) => {
        const id = uuidv4();
        set((state) => {
          const newProjects = [...state.projects, { ...project, id }];
          const newProperties = project.propertyId
            ? state.properties.map((p) =>
                p.id === project.propertyId
                  ? { ...p, projects: [...p.projects, id] }
                  : p
              )
            : state.properties;
          return { projects: newProjects, properties: newProperties };
        });
        return id;
      },
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          properties: state.properties.map((p) => ({
            ...p,
            projects: p.projects.filter((pid) => pid !== id),
          })),
        })),
      updateProjectStatus: (id, status) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status,
                  completedDate:
                    status === 'completed' ? new Date().toISOString() : p.completedDate,
                }
              : p
          ),
        })),
      addTaskToProject: (projectId, task) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: [...p.tasks, { ...task, id: uuidv4() }] }
              : p
          ),
        })),
      toggleTask: (projectId, taskId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                  ),
                }
              : p
          ),
        })),

      // People CRUD
      addPerson: (person) => {
        const id = uuidv4();
        set((state) => ({ people: [...state.people, { ...person, id }] }));
        return id;
      },
      updatePerson: (id, updates) =>
        set((state) => ({
          people: state.people.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deletePerson: (id) =>
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
        })),

      // Finance CRUD
      addFinance: (entry) => {
        const id = uuidv4();
        set((state) => ({ finances: [...state.finances, { ...entry, id }] }));
        return id;
      },
      updateFinance: (id, updates) =>
        set((state) => ({
          finances: state.finances.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),
      deleteFinance: (id) =>
        set((state) => ({
          finances: state.finances.filter((f) => f.id !== id),
        })),

      // Scenario CRUD
      addScenario: (scenario) => {
        const id = uuidv4();
        set((state) => ({
          scenarios: [...state.scenarios, { ...scenario, id }],
        }));
        return id;
      },
      updateScenario: (id, updates) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      deleteScenario: (id) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
        })),

      // Data management
      exportData: () => {
        const state = get();
        return JSON.stringify(
          {
            properties: state.properties,
            projects: state.projects,
            people: state.people,
            finances: state.finances,
            scenarios: state.scenarios,
          },
          null,
          2
        );
      },
      importData: (json) => {
        try {
          const data = JSON.parse(json);
          set({
            properties: data.properties || [],
            projects: data.projects || [],
            people: data.people || [],
            finances: data.finances || [],
            scenarios: data.scenarios || [],
          });
        } catch {
          console.error('Failed to import data: invalid JSON');
        }
      },
      loadSampleData: () => {
        const personSelf = uuidv4();
        const personSpouse = uuidv4();
        const personContractor = uuidv4();
        const personRealtor = uuidv4();

        const prop1 = uuidv4();
        const prop2 = uuidv4();
        const prop3 = uuidv4();
        const prop4 = uuidv4();
        const prop5 = uuidv4();

        const proj1 = uuidv4();
        const proj2 = uuidv4();
        const proj3 = uuidv4();
        const proj4 = uuidv4();
        const proj5 = uuidv4();
        const proj6 = uuidv4();
        const proj7 = uuidv4();
        const proj8 = uuidv4();
        const proj9 = uuidv4();
        const proj10 = uuidv4();
        const proj11 = uuidv4();
        const proj12 = uuidv4();
        const proj13 = uuidv4();
        const proj14 = uuidv4();
        const proj15 = uuidv4();

        const people: Person[] = [
          { id: personSelf, name: 'Alex', role: 'self', contact: 'alex@email.com' },
          { id: personSpouse, name: 'Jordan', role: 'spouse', contact: 'jordan@email.com' },
          { id: personContractor, name: 'Mike Torres', role: 'contractor', contact: '555-0123' },
          { id: personRealtor, name: 'Sarah Chen', role: 'realtor', contact: 'sarah@realty.com' },
        ];

        const projects: Project[] = [
          {
            id: proj1, propertyId: prop1, name: 'Kitchen Renovation', description: 'Full kitchen remodel with new cabinets and countertops',
            status: 'in-progress', priority: 'high', stressWeight: 8, category: 'renovation',
            dependencies: [], assignees: [personSelf, personContractor],
            tasks: [
              { id: uuidv4(), name: 'Finalize cabinet design', completed: true, dueDate: '2026-02-15', assignee: personSelf },
              { id: uuidv4(), name: 'Order countertops', completed: true, dueDate: '2026-02-28', assignee: personContractor },
              { id: uuidv4(), name: 'Demo old kitchen', completed: false, dueDate: '2026-03-20', assignee: personContractor },
              { id: uuidv4(), name: 'Install cabinets', completed: false, dueDate: '2026-04-10', assignee: personContractor },
              { id: uuidv4(), name: 'Install countertops', completed: false, dueDate: '2026-04-20', assignee: personContractor },
            ],
            estimatedCost: 35000, actualCost: 12000, startDate: '2026-02-01', targetDate: '2026-05-01', completedDate: null, notes: 'Going with quartz countertops',
          },
          {
            id: proj2, propertyId: prop1, name: 'Master Bath Update', description: 'Replace vanity and re-tile shower',
            status: 'not-started', priority: 'medium', stressWeight: 5, category: 'renovation',
            dependencies: [proj1], assignees: [personContractor],
            tasks: [
              { id: uuidv4(), name: 'Pick tile', completed: false, dueDate: '2026-05-01', assignee: personSpouse },
              { id: uuidv4(), name: 'Get plumber quote', completed: false, dueDate: '2026-05-15', assignee: personSelf },
            ],
            estimatedCost: 12000, actualCost: 0, startDate: null, targetDate: '2026-07-01', completedDate: null, notes: '',
          },
          {
            id: proj3, propertyId: prop1, name: 'Landscaping Front Yard', description: 'New walkway and native plantings',
            status: 'not-started', priority: 'low', stressWeight: 3, category: 'maintenance',
            dependencies: [], assignees: [personSpouse],
            tasks: [
              { id: uuidv4(), name: 'Research native plants', completed: true, dueDate: null, assignee: personSpouse },
              { id: uuidv4(), name: 'Get landscaper quotes', completed: false, dueDate: '2026-04-01', assignee: personSelf },
            ],
            estimatedCost: 5000, actualCost: 0, startDate: null, targetDate: '2026-06-01', completedDate: null, notes: 'Want drought-tolerant plants',
          },
          {
            id: proj4, propertyId: prop2, name: 'Sell Downtown Condo', description: 'List and sell the downtown condo',
            status: 'in-progress', priority: 'critical', stressWeight: 9, category: 'sale',
            dependencies: [], assignees: [personSelf, personRealtor],
            tasks: [
              { id: uuidv4(), name: 'Stage the unit', completed: true, dueDate: '2026-02-01', assignee: personRealtor },
              { id: uuidv4(), name: 'Professional photos', completed: true, dueDate: '2026-02-05', assignee: personRealtor },
              { id: uuidv4(), name: 'List on MLS', completed: true, dueDate: '2026-02-10', assignee: personRealtor },
              { id: uuidv4(), name: 'Review offers', completed: false, dueDate: '2026-03-15', assignee: personSelf },
              { id: uuidv4(), name: 'Close sale', completed: false, dueDate: '2026-04-30', assignee: personRealtor },
            ],
            estimatedCost: 15000, actualCost: 8500, startDate: '2026-01-15', targetDate: '2026-04-30', completedDate: null, notes: 'Listed at $420K, have 2 showings scheduled',
          },
          {
            id: proj5, propertyId: prop3, name: 'Clear Land for Building', description: 'Clear trees and grade the lot',
            status: 'blocked', priority: 'high', stressWeight: 7, category: 'maintenance',
            dependencies: [proj4], assignees: [personSelf, personContractor],
            tasks: [
              { id: uuidv4(), name: 'Get survey done', completed: true, dueDate: '2026-01-30', assignee: personSelf },
              { id: uuidv4(), name: 'Environmental assessment', completed: false, dueDate: '2026-03-30', assignee: personSelf },
              { id: uuidv4(), name: 'Hire clearing crew', completed: false, dueDate: null, assignee: personContractor },
            ],
            estimatedCost: 18000, actualCost: 3200, startDate: '2026-01-10', targetDate: '2026-06-01', completedDate: null, notes: 'Waiting on condo sale funds',
          },
          {
            id: proj6, propertyId: prop3, name: 'New Home Design', description: 'Work with architect on custom home plans',
            status: 'not-started', priority: 'medium', stressWeight: 6, category: 'purchase',
            dependencies: [proj5], assignees: [personSelf, personSpouse],
            tasks: [
              { id: uuidv4(), name: 'Interview architects', completed: false, dueDate: '2026-04-15', assignee: personSelf },
              { id: uuidv4(), name: 'Create wish list', completed: true, dueDate: null, assignee: personSpouse },
            ],
            estimatedCost: 25000, actualCost: 0, startDate: null, targetDate: '2026-09-01', completedDate: null, notes: '3BR/2BA with home office',
          },
          {
            id: proj7, propertyId: prop4, name: 'Rental Unit Repairs', description: 'Fix HVAC and repaint units A and B',
            status: 'in-progress', priority: 'high', stressWeight: 7, category: 'maintenance',
            dependencies: [], assignees: [personContractor],
            tasks: [
              { id: uuidv4(), name: 'HVAC inspection', completed: true, dueDate: '2026-02-20', assignee: personContractor },
              { id: uuidv4(), name: 'Order HVAC parts', completed: true, dueDate: '2026-03-01', assignee: personContractor },
              { id: uuidv4(), name: 'Install new HVAC unit A', completed: false, dueDate: '2026-03-20', assignee: personContractor },
              { id: uuidv4(), name: 'Repaint unit A', completed: false, dueDate: '2026-03-25', assignee: personContractor },
              { id: uuidv4(), name: 'Repaint unit B', completed: false, dueDate: '2026-04-01', assignee: personContractor },
            ],
            estimatedCost: 8000, actualCost: 3500, startDate: '2026-02-15', targetDate: '2026-04-15', completedDate: null, notes: 'Tenant in unit B needs 48hr notice',
          },
          {
            id: proj8, propertyId: prop4, name: 'Raise Rent Unit C', description: 'Market analysis and lease renewal for unit C',
            status: 'completed', priority: 'medium', stressWeight: 4, category: 'financial',
            dependencies: [], assignees: [personSelf],
            tasks: [
              { id: uuidv4(), name: 'Research market rates', completed: true, dueDate: '2026-01-15', assignee: personSelf },
              { id: uuidv4(), name: 'Send renewal letter', completed: true, dueDate: '2026-01-20', assignee: personSelf },
              { id: uuidv4(), name: 'Tenant signs new lease', completed: true, dueDate: '2026-02-01', assignee: personSelf },
            ],
            estimatedCost: 0, actualCost: 0, startDate: '2026-01-10', targetDate: '2026-02-01', completedDate: '2026-01-28', notes: 'Raised from $1200 to $1350',
          },
          {
            id: proj9, propertyId: prop5, name: 'Cabin Roof Replacement', description: 'Replace aging roof on lake cabin',
            status: 'not-started', priority: 'high', stressWeight: 6, category: 'maintenance',
            dependencies: [], assignees: [personContractor],
            tasks: [
              { id: uuidv4(), name: 'Get 3 quotes', completed: true, dueDate: '2026-03-01', assignee: personSelf },
              { id: uuidv4(), name: 'Choose contractor', completed: false, dueDate: '2026-03-15', assignee: personSelf },
              { id: uuidv4(), name: 'Schedule work', completed: false, dueDate: '2026-04-01', assignee: personContractor },
            ],
            estimatedCost: 15000, actualCost: 0, startDate: null, targetDate: '2026-05-15', completedDate: null, notes: 'Metal roof preferred',
          },
          {
            id: proj10, propertyId: null, name: 'Family Vacation Planning', description: 'Plan summer trip to Europe',
            status: 'in-progress', priority: 'medium', stressWeight: 4, category: 'lifestyle',
            dependencies: [], assignees: [personSpouse],
            tasks: [
              { id: uuidv4(), name: 'Book flights', completed: true, dueDate: '2026-03-01', assignee: personSpouse },
              { id: uuidv4(), name: 'Reserve hotels', completed: false, dueDate: '2026-03-30', assignee: personSpouse },
              { id: uuidv4(), name: 'Plan itinerary', completed: false, dueDate: '2026-04-15', assignee: personSpouse },
            ],
            estimatedCost: 12000, actualCost: 4200, startDate: '2026-02-01', targetDate: '2026-07-01', completedDate: null, notes: '2 weeks in Italy and Greece',
          },
          {
            id: proj11, propertyId: null, name: 'Emergency Fund Top-Up', description: 'Build emergency fund to 6 months expenses',
            status: 'in-progress', priority: 'high', stressWeight: 5, category: 'financial',
            dependencies: [], assignees: [personSelf],
            tasks: [
              { id: uuidv4(), name: 'Set up auto-transfer', completed: true, dueDate: null, assignee: personSelf },
              { id: uuidv4(), name: 'Review monthly budget', completed: false, dueDate: '2026-03-31', assignee: personSelf },
            ],
            estimatedCost: 0, actualCost: 0, startDate: '2026-01-01', targetDate: '2026-12-31', completedDate: null, notes: 'Target: $30K. Currently at $18K',
          },
          {
            id: proj12, propertyId: prop1, name: 'Solar Panel Installation', description: 'Install 8kW solar array on main house',
            status: 'not-started', priority: 'medium', stressWeight: 4, category: 'renovation',
            dependencies: [proj1], assignees: [personSelf],
            tasks: [
              { id: uuidv4(), name: 'Get solar assessment', completed: false, dueDate: '2026-04-01', assignee: personSelf },
              { id: uuidv4(), name: 'Apply for permits', completed: false, dueDate: '2026-05-01', assignee: personSelf },
              { id: uuidv4(), name: 'Schedule installation', completed: false, dueDate: '2026-06-01', assignee: personSelf },
            ],
            estimatedCost: 22000, actualCost: 0, startDate: null, targetDate: '2026-08-01', completedDate: null, notes: 'Check for federal tax credits',
          },
          {
            id: proj13, propertyId: prop5, name: 'Dock Repair', description: 'Repair and extend lake dock',
            status: 'not-started', priority: 'low', stressWeight: 2, category: 'maintenance',
            dependencies: [], assignees: [personSelf, personContractor],
            tasks: [
              { id: uuidv4(), name: 'Inspect current dock', completed: false, dueDate: '2026-04-15', assignee: personSelf },
              { id: uuidv4(), name: 'Get marine permits', completed: false, dueDate: '2026-05-01', assignee: personSelf },
            ],
            estimatedCost: 6000, actualCost: 0, startDate: null, targetDate: '2026-06-15', completedDate: null, notes: 'Need before summer',
          },
          {
            id: proj14, propertyId: null, name: 'Life Insurance Review', description: 'Review and update life insurance policies',
            status: 'completed', priority: 'medium', stressWeight: 3, category: 'financial',
            dependencies: [], assignees: [personSelf, personSpouse],
            tasks: [
              { id: uuidv4(), name: 'Gather current policies', completed: true, dueDate: '2026-01-15', assignee: personSelf },
              { id: uuidv4(), name: 'Meet with advisor', completed: true, dueDate: '2026-02-01', assignee: personSelf },
              { id: uuidv4(), name: 'Sign new policy', completed: true, dueDate: '2026-02-15', assignee: personSelf },
            ],
            estimatedCost: 0, actualCost: 0, startDate: '2026-01-10', targetDate: '2026-02-28', completedDate: '2026-02-12', notes: 'Increased coverage to $1M each',
          },
          {
            id: proj15, propertyId: prop2, name: 'Condo Staging Cleanup', description: 'Final cleaning after staging materials removed',
            status: 'not-started', priority: 'low', stressWeight: 2, category: 'maintenance',
            dependencies: [proj4], assignees: [personSelf],
            tasks: [
              { id: uuidv4(), name: 'Schedule cleaning service', completed: false, dueDate: null, assignee: personSelf },
            ],
            estimatedCost: 500, actualCost: 0, startDate: null, targetDate: null, completedDate: null, notes: 'After sale closes',
          },
        ];

        const properties: Property[] = [
          {
            id: prop1, name: 'Main House', type: 'house', address: '742 Evergreen Terrace',
            description: 'Primary residence - 4BR/3BA colonial', imageUrl: undefined,
            isCurrentHome: true, estimatedValue: 485000, mortgageBalance: 280000,
            monthlyPayment: 2100, projects: [proj1, proj2, proj3, proj12], notes: 'Bought in 2019', color: '#6B8F71',
          },
          {
            id: prop2, name: 'Downtown Condo', type: 'house', address: '88 Market St, Unit 4B',
            description: '2BR/1BA condo - currently for sale', imageUrl: undefined,
            isCurrentHome: false, estimatedValue: 420000, mortgageBalance: 195000,
            monthlyPayment: 1650, projects: [proj4, proj15], notes: 'Listed Feb 2026', color: '#D4A843',
          },
          {
            id: prop3, name: 'Hillside Lot', type: 'land', address: '15 Ridge Road',
            description: '2.5 acre lot for future custom build', imageUrl: undefined,
            isCurrentHome: false, estimatedValue: 120000, mortgageBalance: 0,
            monthlyPayment: 0, projects: [proj5, proj6], notes: 'Purchased cash 2024', color: '#7AAFBF',
          },
          {
            id: prop4, name: 'Rental Triplex', type: 'house', address: '200 Oak Avenue',
            description: '3-unit rental property', imageUrl: undefined,
            isCurrentHome: false, estimatedValue: 650000, mortgageBalance: 410000,
            monthlyPayment: 2800, projects: [proj7, proj8], notes: 'Generates $3600/mo gross rent', color: '#BF7A9E',
          },
          {
            id: prop5, name: 'Lake Cabin', type: 'house-and-land', address: '5 Lakeshore Drive',
            description: 'Weekend cabin on 1 acre lakefront', imageUrl: undefined,
            isCurrentHome: false, estimatedValue: 280000, mortgageBalance: 140000,
            monthlyPayment: 1100, projects: [proj9, proj13], notes: 'Great for summer weekends', color: '#7A8FBF',
          },
        ];

        const finances: FinancialEntry[] = [
          { id: uuidv4(), projectId: proj1, propertyId: prop1, type: 'expense', amount: 12000, description: 'Kitchen demo and cabinets deposit', date: '2026-02-15', category: 'renovation' },
          { id: uuidv4(), projectId: proj4, propertyId: prop2, type: 'expense', amount: 8500, description: 'Staging and listing costs', date: '2026-02-01', category: 'sale' },
          { id: uuidv4(), projectId: proj4, propertyId: prop2, type: 'projected-income', amount: 420000, description: 'Expected sale price', date: '2026-04-30', category: 'sale' },
          { id: uuidv4(), projectId: proj5, propertyId: prop3, type: 'expense', amount: 3200, description: 'Land survey', date: '2026-01-30', category: 'maintenance' },
          { id: uuidv4(), projectId: proj7, propertyId: prop4, type: 'expense', amount: 3500, description: 'HVAC parts and labor', date: '2026-03-05', category: 'maintenance' },
          { id: uuidv4(), projectId: null, propertyId: prop4, type: 'income', amount: 3600, description: 'Monthly rent (Mar)', date: '2026-03-01', category: 'rental' },
          { id: uuidv4(), projectId: null, propertyId: prop4, type: 'income', amount: 3600, description: 'Monthly rent (Feb)', date: '2026-02-01', category: 'rental' },
          { id: uuidv4(), projectId: proj10, propertyId: null, type: 'expense', amount: 4200, description: 'Flight bookings', date: '2026-02-20', category: 'lifestyle' },
          { id: uuidv4(), projectId: proj1, propertyId: prop1, type: 'projected-expense', amount: 23000, description: 'Remaining kitchen reno budget', date: '2026-04-30', category: 'renovation' },
        ];

        const scenarios: Scenario[] = [
          {
            id: uuidv4(), name: 'Sell Condo First', description: 'Sell condo, use proceeds to fund land clearing and new home build',
            steps: [
              { id: uuidv4(), projectId: proj4, order: 1, notes: 'Close condo sale for ~$420K' },
              { id: uuidv4(), projectId: proj5, order: 2, notes: 'Use condo proceeds to clear land' },
              { id: uuidv4(), projectId: proj6, order: 3, notes: 'Begin home design with architect' },
              { id: uuidv4(), projectId: proj1, order: 4, notes: 'Continue kitchen reno in parallel' },
            ],
          },
          {
            id: uuidv4(), name: 'Renovate Then Sell', description: 'Finish main house renovations to maximize value, then consider selling',
            steps: [
              { id: uuidv4(), projectId: proj1, order: 1, notes: 'Complete kitchen first' },
              { id: uuidv4(), projectId: proj2, order: 2, notes: 'Then master bath' },
              { id: uuidv4(), projectId: proj12, order: 3, notes: 'Add solar panels for value' },
              { id: uuidv4(), projectId: proj3, order: 4, notes: 'Curb appeal with landscaping' },
            ],
          },
        ];

        set({
          properties,
          projects,
          people,
          finances,
          scenarios,
        });
      },

    }),
    {
      name: 'lifemapper-storage',
      partialize: (state) => ({
        properties: state.properties,
        projects: state.projects,
        people: state.people,
        finances: state.finances,
        scenarios: state.scenarios,
      }),
      onRehydrateStorage: () => {
        return () => {
          // After localStorage rehydration, check for Electron file storage
          if (window.electronAPI?.isElectron) {
            window.electronAPI.loadData().then((result) => {
              if (result.success && result.data) {
                const data = result.data as Record<string, unknown>;
                useStore.setState({
                  properties: (data.properties as Property[]) ?? [],
                  projects: (data.projects as Project[]) ?? [],
                  people: (data.people as Person[]) ?? [],
                  finances: (data.finances as FinancialEntry[]) ?? [],
                  scenarios: (data.scenarios as Scenario[]) ?? [],
                });
              }
            });
          }

          // Subscribe to state changes and sync to Electron file storage
          useStore.subscribe((state) => {
            if (window.electronAPI?.isElectron) {
              window.electronAPI.saveData({
                properties: state.properties,
                projects: state.projects,
                people: state.people,
                finances: state.finances,
                scenarios: state.scenarios,
              });
            }
          });
        };
      },
    }
  )
);

export default useStore;
