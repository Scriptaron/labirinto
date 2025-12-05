import { h, createContext } from 'preact';
import { useState, useEffect, useRef, useContext } from 'preact/hooks';

// --- Context for Tree State ---
type TreeAction = 'expand' | 'collapse' | 'none';
const TreeContext = createContext<{ action: TreeAction; actionId: number }>({ action: 'none', actionId: 0 });

// --- Recursive JSON Editor ---

const getType = (value: any) => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
};

const RecursiveValueEditor = ({
    value,
    onChange,
    label,
    onDelete,
    recursiveAction
}: {
    value: any,
    onChange: (val: any) => void,
    label?: string,
    onDelete?: () => void,
    recursiveAction?: { type: 'expand' | 'collapse'; id: number } | null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [childAction, setChildAction] = useState<{ type: 'expand' | 'collapse'; id: number } | null>(null);
    const [recursiveState, setRecursiveState] = useState<'expand' | 'collapse'>('expand');

    // Local editing state to prevent "disappearing text" and focus loss
    const [localValue, setLocalValue] = useState(String(value));
    const [isEditing, setIsEditing] = useState(false);

    const type = getType(value);
    const isObject = type === 'object';
    const isArray = type === 'array';
    const isContainer = isObject || isArray;

    // State for adding new items
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Sync local value when prop changes (only if not editing)
    useEffect(() => {
        if (!isEditing) {
            setLocalValue(String(value));
        }
    }, [value, isEditing]);

    // Auto-expand root or if it's a small object
    useEffect(() => {
        if (isContainer && Object.keys(value).length < 3) {
            setIsOpen(true);
        }
    }, []);

    // React to parent's recursive request
    useEffect(() => {
        if (recursiveAction) {
            setIsOpen(recursiveAction.type === 'expand');
            setChildAction(recursiveAction);
            setRecursiveState(recursiveAction.type === 'expand' ? 'collapse' : 'expand');
        }
    }, [recursiveAction]);

    const handleCommit = () => {
        const val = localValue;
        // Try to parse numbers/booleans, otherwise keep as string
        if (val === 'true') onChange(true);
        else if (val === 'false') onChange(false);
        else if (!isNaN(Number(val)) && val.trim() !== '') onChange(Number(val));
        else onChange(val);
        setIsEditing(false);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            handleCommit();
        }
    };

    const handleChildChange = (key: string | number, childValue: any) => {
        if (isArray) {
            const newData = [...value];
            newData[key as number] = childValue;
            onChange(newData);
        } else {
            const newData = { ...value, [key]: childValue };
            onChange(newData);
        }
    };

    const handleChildDelete = (key: string | number) => {
        if (isArray) {
            // Fix: Parse key to number for array filtering
            const indexToDelete = Number(key);
            const newData = value.filter((_: any, index: number) => index !== indexToDelete);
            onChange(newData);
        } else {
            const newData = { ...value };
            delete newData[key];
            onChange(newData);
        }
    };

    const handleAdd = () => {
        if (isArray) {
            const newData = [...value, newValue || ''];
            onChange(newData);
        } else {
            if (newKey) {
                const newData = { ...value, [newKey]: newValue || '' };
                onChange(newData);
            }
        }
        setNewKey('');
        setNewValue('');
        setIsAdding(false);
    };

    const handleRecursiveToggle = (e: any) => {
        e.stopPropagation();
        const newType = recursiveState;
        setRecursiveState(prev => prev === 'expand' ? 'collapse' : 'expand');
        setChildAction({ type: newType, id: Date.now() });
    };

    const renderLabel = () => (
        <span style={{
            color: label ? '#eab308' : '#888',
            marginRight: '8px',
            fontSize: '12px',
            fontFamily: 'monospace'
        }}>
            {label ? `${label}:` : ''}
        </span>
    );

    const hasNestedContainer = (val: any) => {
        if (!val || typeof val !== 'object') return false;
        return Object.values(val).some(child => child && typeof child === 'object');
    };

    const renderRightControls = () => {
        const keys = isContainer ? Object.keys(value) : [];
        const isEmpty = keys.length === 0;
        const showRecursiveToggle = isContainer && !isEmpty && hasNestedContainer(value);

        return (
            <div style={{
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.2s',
                display: 'flex',
                gap: '4px',
                marginLeft: '8px'
            }}>
                {showRecursiveToggle && (
                    <button
                        onClick={handleRecursiveToggle}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#bbb',
                            cursor: 'pointer',
                            fontSize: '10px',
                            padding: '0 4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderLeft: '1px solid #333'
                        }}
                        title={recursiveState === 'expand' ? "Expand All Children" : "Collapse All Children"}
                    >
                        {recursiveState === 'expand' ? '⇊' : '⇈'}
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0 2px'
                        }}
                        title="Delete"
                    >
                        ×
                    </button>
                )}
            </div>
        );
    };

    if (isContainer) {
        const keys = Object.keys(value);
        const isEmpty = keys.length === 0;
        const preview = isEmpty
            ? (isArray ? '[]' : '{}')
            : (isArray ? `Array(${keys.length})` : `{...}`);

        return (
            <div
                style={{ marginLeft: label ? '12px' : '0' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            border: 'none',
                            background: 'none',
                            color: '#bbb',
                            cursor: 'pointer',
                            fontSize: '10px',
                            padding: '0 4px 0 0',
                            width: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {isOpen ? '▼' : '▶'}
                    </button>
                    {renderLabel()}
                    <span
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ color: '#666', fontSize: '11px', cursor: 'pointer', fontStyle: 'italic' }}
                    >
                        {preview}
                    </span>
                    {renderRightControls()}
                </div>

                {isOpen && (
                    <div style={{ marginLeft: '16px', borderLeft: '1px solid #333', paddingLeft: '8px' }}>
                        {keys.map((key, index) => (
                            <RecursiveValueEditor
                                key={key}
                                label={isArray ? String(index) : key}
                                value={value[key]}
                                onChange={(val) => handleChildChange(key, val)}
                                onDelete={() => handleChildDelete(key)}
                                recursiveAction={childAction}
                            />
                        ))}

                        {/* Add Item Row */}
                        <div style={{ marginTop: '4px' }}>
                            {!isAdding ? (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    style={{
                                        background: 'none',
                                        border: '1px dashed #444',
                                        color: '#666',
                                        fontSize: '10px',
                                        padding: '2px 8px',
                                        borderRadius: '2px',
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left'
                                    }}
                                >
                                    + Add Item
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: '#222', padding: '4px', borderRadius: '4px' }}>
                                    {!isArray && (
                                        <input
                                            type="text"
                                            placeholder="Key"
                                            value={newKey}
                                            onChange={(e) => setNewKey((e.target as HTMLInputElement).value)}
                                            style={{
                                                flex: 1,
                                                background: '#111',
                                                border: '1px solid #444',
                                                color: '#ccc',
                                                padding: '2px 4px',
                                                borderRadius: '2px',
                                                fontSize: '11px',
                                                minWidth: 0
                                            }}
                                            autoFocus
                                        />
                                    )}
                                    <input
                                        type="text"
                                        placeholder="Value (JSON or string)"
                                        value={newValue}
                                        onChange={(e) => setNewValue((e.target as HTMLInputElement).value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAdd();
                                            if (e.key === 'Escape') setIsAdding(false);
                                        }}
                                        style={{
                                            flex: 2,
                                            background: '#111',
                                            border: '1px solid #444',
                                            color: '#ccc',
                                            padding: '2px 4px',
                                            borderRadius: '2px',
                                            fontSize: '11px',
                                            minWidth: 0
                                        }}
                                    />
                                    <button onClick={handleAdd} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>✓</button>
                                    <button onClick={() => setIsAdding(false)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                                </div>

                            )}
                        </div>
                    </div >
                )}
            </div >
        );
    }

    // Primitive Value
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '2px 0',
                marginLeft: label ? '12px' : '0'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {renderLabel()}
            <input
                type="text"
                value={localValue}
                onFocus={() => setIsEditing(true)}
                onBlur={handleCommit}
                onChange={(e) => setLocalValue((e.target as HTMLInputElement).value)}
                onKeyDown={handleKeyDown}
                style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #333',
                    color: typeof value === 'string' ? '#a5f3fc' : (typeof value === 'number' ? '#fca5a5' : '#fde047'),
                    padding: '2px 0',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    minWidth: 0
                }}
            />
            {renderRightControls()}
        </div>
    );
};


// Route Tree Components
type TreeNode = {
    name: string;
    path?: string;
    title?: string;
    children: Record<string, TreeNode>;
};

const buildTree = (routes: any[]) => {
    const root: TreeNode = { name: 'root', children: {} };
    routes.forEach(route => {
        const parts = route.path.split('/').filter(Boolean);
        let current = root;

        if (parts.length === 0) {
            // Root path /
            if (!current.children['/']) {
                current.children['/'] = { name: '/', path: route.path, title: route.title, children: {} };
            }
            return;
        }

        parts.forEach((part: string, index: number) => {
            if (!current.children[part]) {
                current.children[part] = { name: part, children: {} };
            }
            current = current.children[part];
            if (index === parts.length - 1) {
                current.path = route.path;
                current.title = route.title;
            }
        });
    });
    return root;
};

const RouteNode = ({ node, depth = 0 }: { node: TreeNode, depth: number }) => {
    const [isOpen, setIsOpen] = useState(true);
    const { action, actionId } = useContext(TreeContext);
    const hasChildren = Object.keys(node.children).length > 0;
    const isRoot = node.name === 'root';

    // React to global expand/collapse actions
    useEffect(() => {
        if (action === 'expand') setIsOpen(true);
        if (action === 'collapse') setIsOpen(false);
    }, [action, actionId]);

    if (isRoot) {
        return (
            <div>
                {Object.values(node.children).map(child => (
                    <RouteNode key={child.name} node={child} depth={0} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ marginLeft: depth * 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0' }}>
                {hasChildren ? (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            border: 'none',
                            background: 'none',
                            color: '#bbb',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: 0,
                            width: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {isOpen ? '▼' : '▶'}
                    </button>
                ) : (
                    <span style={{ width: '16px' }}></span>
                )}

                {node.path ? (
                    <a href={node.path} style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: hasChildren ? 'bold' : 'normal' }}>{node.name}</span>
                        {node.title && <span style={{ color: '#9ca3af', fontSize: '11px' }}>({node.title})</span>}
                    </a>
                ) : (
                    <span style={{ color: '#f3f4f6', fontSize: '13px', fontWeight: 'bold' }}>{node.name}</span>
                )}
            </div>

            {isOpen && hasChildren && (
                <div>
                    {Object.values(node.children).map(child => (
                        <RouteNode key={child.name} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const StorageItemEditor = ({
    item,
    onUpdate,
    onDelete,
    onDuplicate,
    storageTreeState
}: {
    item: { key: string; value: string; type: 'local' | 'session' | 'cookie'; parsedValue: any; valueType: string },
    onUpdate: (type: 'local' | 'session' | 'cookie', key: string, value: string) => void,
    onDelete: (type: 'local' | 'session' | 'cookie', key: string) => void,
    onDuplicate: (type: 'local' | 'session' | 'cookie', key: string, value: string) => void,
    storageTreeState: { type: 'expand' | 'collapse'; id: number } | null
}) => {
    const [localValue, setLocalValue] = useState(item.value);
    const [isEditing, setIsEditing] = useState(false);

    // Rename state
    const [isRenaming, setIsRenaming] = useState(false);
    const [newKeyName, setNewKeyName] = useState(item.key);

    const [copyFeedback, setCopyFeedback] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setLocalValue(item.value);
        }
    }, [item.value, isEditing]);

    const handleCommit = () => {
        if (localValue !== item.value) {
            onUpdate(item.type, item.key, localValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            handleCommit();
        }
    };

    const handleRename = () => {
        if (newKeyName !== item.key && newKeyName.trim() !== '') {
            // Delete old, create new
            onDelete(item.type, item.key);
            onUpdate(item.type, newKeyName, item.value);
        }
        setIsRenaming(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(item.value);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 1000);
    };

    return (
        <div style={{ marginBottom: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                {isRenaming ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, marginRight: '8px' }}>
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName((e.target as HTMLInputElement).value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename();
                                if (e.key === 'Escape') setIsRenaming(false);
                            }}
                            autoFocus
                            style={{
                                background: '#111',
                                border: '1px solid #3b82f6',
                                color: '#fff',
                                padding: '2px 4px',
                                borderRadius: '2px',
                                fontSize: '12px',
                                flex: 1,
                                minWidth: '150px'
                            }}
                        />
                        <button onClick={handleRename} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>✓</button>
                        <button onClick={() => setIsRenaming(false)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                            color: item.type === 'cookie' ? '#f472b6' : (item.type === 'session' ? '#4ade80' : '#60a5fa'),
                            fontWeight: 'bold',
                            fontSize: '13px'
                        }}>
                            {item.key}
                        </span>
                        <button
                            onClick={() => { setNewKeyName(item.key); setIsRenaming(true); }}
                            style={{ border: 'none', background: 'none', color: '#666', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                            title="Rename Key"
                        >
                            ✎
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{
                        fontSize: '10px',
                        padding: '2px 4px',
                        borderRadius: '2px',
                        background: '#333',
                        color: '#888'
                    }}>
                        {item.valueType.toUpperCase()}
                    </span>
                    <span style={{
                        fontSize: '10px',
                        padding: '2px 4px',
                        borderRadius: '2px',
                        background: '#333',
                        color: '#888'
                    }}>
                        {item.type === 'cookie' ? 'CK' : (item.type === 'session' ? 'SS' : 'LS')}
                    </span>
                    <button
                        onClick={handleCopy}
                        style={{ border: 'none', background: 'none', color: copyFeedback ? '#4ade80' : '#bbb', cursor: 'pointer', padding: 0, fontSize: '14px', marginRight: '4px' }}
                        title="Copy Value"
                    >
                        {copyFeedback ? '✓' : '📋'}
                    </button>
                    <button
                        onClick={() => onDuplicate(item.type, item.key, item.value)}
                        style={{ border: 'none', background: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, fontSize: '14px', marginRight: '4px' }}
                        title="Duplicate Item"
                    >
                        ❐
                    </button>
                    <button
                        onClick={() => onDelete(item.type, item.key)}
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: '14px' }}
                        title="Delete Item"
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Smart Editor based on type */}
            {item.valueType === 'boolean' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        checked={item.value === 'true'}
                        onChange={(e) => onUpdate(item.type, item.key, String((e.target as HTMLInputElement).checked))}
                    />
                    <span style={{ color: item.value === 'true' ? '#4ade80' : '#ef4444' }}>{item.value}</span>
                </div>
            ) : (item.valueType === 'object' || item.valueType === 'array') ? (
                <div style={{ background: '#111', padding: '8px', borderRadius: '4px', border: '1px solid #333' }}>
                    <RecursiveValueEditor
                        value={JSON.parse(item.value)}
                        onChange={(newData) => onUpdate(item.type, item.key, JSON.stringify(newData))}
                        recursiveAction={storageTreeState}
                    />
                </div>
            ) : (
                <input
                    type="text"
                    value={localValue}
                    onFocus={() => setIsEditing(true)}
                    onBlur={handleCommit}
                    onChange={(e) => setLocalValue((e.target as HTMLInputElement).value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        width: '100%',
                        background: '#111',
                        border: '1px solid #333',
                        color: '#ccc',
                        padding: '4px 6px',
                        borderRadius: '2px',
                        fontSize: '12px'
                    }}
                />
            )}
        </div>
    );
};

const DevTools = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [mockAuth, setMockAuth] = useState(false);
    const [mockFixtures, setMockFixtures] = useState(false);
    const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
    const [theme, setTheme] = useState('light');
    const [currentLang, setCurrentLang] = useState('pt');
    const [storageItems, setStorageItems] = useState<{ key: string; value: string; type: 'local' | 'session' | 'cookie'; parsedValue: any; valueType: string }[]>([]);

    // New Storage Item State
    const [isAddingStorage, setIsAddingStorage] = useState(false);
    const [newStorageKey, setNewStorageKey] = useState('');
    const [newStorageValue, setNewStorageValue] = useState('');
    const [newStorageType, setNewStorageType] = useState<'local' | 'session' | 'cookie'>('local');

    // Minimized state with persistence
    const [isMinimized, setIsMinimized] = useState(() => {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('devtools_minimized') === 'true';
        }
        return false;
    });

    const [size, setSize] = useState(() => {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('devtools_size');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) { }
            }
        }
        return { width: 0, height: 0 };
    });
    const [resizeDir, setResizeDir] = useState<string | null>(null);
    const [wasDragging, setWasDragging] = useState(false);

    const [activeTab, setActiveTab] = useState<'general' | 'routes' | 'storage' | 'seo' | 'perf' | 'content' | 'recs'>(() => {
        if (typeof localStorage !== 'undefined') {
            return (localStorage.getItem('devtools_active_tab') as any) || 'general';
        }
        return 'general';
    });

    const [routes, setRoutes] = useState<{ path: string; title: string }[]>([]);
    const [seoData, setSeoData] = useState<any>(null);
    const [perfData, setPerfData] = useState<any>(null);
    const [contentData, setContentData] = useState<any>(null);

    // Tree State
    const [treeState, setTreeState] = useState<{ action: TreeAction; actionId: number }>({ action: 'none', actionId: 0 });
    // Storage Tree State
    const [storageTreeState, setStorageTreeState] = useState<{ type: 'expand' | 'collapse'; id: number } | null>(null);

    const dragRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Persist active tab
    useEffect(() => {
        localStorage.setItem('devtools_active_tab', activeTab);
    }, [activeTab]);

    // Persist minimized state
    useEffect(() => {
        localStorage.setItem('devtools_minimized', String(isMinimized));
    }, [isMinimized]);

    // Persist size
    useEffect(() => {
        localStorage.setItem('devtools_size', JSON.stringify(size));
    }, [size]);

    const detectType = (value: string) => {
        if (value === 'true' || value === 'false') return 'boolean';
        if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return 'array';
            if (typeof parsed === 'object' && parsed !== null) return 'object';
        } catch (e) { }
        return 'string';
    };

    const refreshStorage = () => {
        const items: { key: string; value: string; type: 'local' | 'session' | 'cookie'; parsedValue: any; valueType: string }[] = [];

        // LocalStorage
        if (typeof localStorage !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const val = localStorage.getItem(key) || '';
                    items.push({ key, value: val, type: 'local', parsedValue: val, valueType: detectType(val) });
                }
            }
        }

        // SessionStorage
        if (typeof sessionStorage !== 'undefined') {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key) {
                    const val = sessionStorage.getItem(key) || '';
                    items.push({ key, value: val, type: 'session', parsedValue: val, valueType: detectType(val) });
                }
            }
        }

        // Cookies
        if (typeof document !== 'undefined' && document.cookie) {
            document.cookie.split(';').forEach(cookie => {
                const parts = cookie.split('=');
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                if (key) {
                    const val = decodeURIComponent(value || '');
                    items.push({ key, value: val, type: 'cookie', parsedValue: val, valueType: detectType(val) });
                }
            });
        }

        setStorageItems(items);
    };

    // Initialize state
    useEffect(() => {
        // Visibility
        const savedVisibility = localStorage.getItem('devtools_visible');
        if (savedVisibility === 'true') {
            setIsVisible(true);
        }

        // Theme
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(savedTheme);

        // Language
        const path = window.location.pathname;
        const lang = path.split('/')[1];
        if (['pt', 'en', 'es'].includes(lang)) {
            setCurrentLang(lang);
        }

        // Storage
        refreshStorage();
    }, []); // Run only once on mount

    // Data Fetching based on Tab
    useEffect(() => {
        if (!isVisible) return;

        if (activeTab === 'routes' && routes.length === 0) {
            fetch('/api/dev/routes.json')
                .then(res => res.json())
                .then(data => setRoutes(data))
                .catch(err => console.error('Failed to fetch routes', err));
        }

        if (activeTab === 'storage') {
            refreshStorage();
        }

        if (activeTab === 'content' && !contentData) {
            fetch('/api/dev/content.json')
                .then(res => res.json())
                .then(data => setContentData(data))
                .catch(err => console.error('Failed to fetch content', err));
        }

        if (activeTab === 'seo') {
            const metas = document.getElementsByTagName('meta');
            const metaData: any = {};
            for (let i = 0; i < metas.length; i++) {
                const name = metas[i].getAttribute('name') || metas[i].getAttribute('property');
                if (name) metaData[name] = metas[i].getAttribute('content');
            }
            setSeoData({
                title: document.title,
                canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'N/A',
                meta: metaData
            });
        }

        if (activeTab === 'perf') {
            // Simple perf metrics
            if (window.performance) {
                const navEntries = performance.getEntriesByType('navigation');
                const navEntry = navEntries.length > 0 ? (navEntries[0] as PerformanceNavigationTiming) : null;

                setPerfData({
                    loadTime: navEntry ? (navEntry.loadEventEnd - navEntry.startTime).toFixed(2) : 'N/A',
                    domReady: navEntry ? (navEntry.domContentLoadedEventEnd - navEntry.startTime).toFixed(2) : 'N/A',
                    memory: (performance as any).memory ? {
                        used: ((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
                        limit: ((performance as any).memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
                    } : null
                });
            }
        }
    }, [activeTab, isVisible]);

    // Toggle visibility with hotkey (Ctrl + .)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === '.') {
                setIsVisible((prev) => {
                    const newState = !prev;
                    localStorage.setItem('devtools_visible', String(newState));
                    return newState;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Screen size tracking and clamping
    useEffect(() => {
        const updateSize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            setScreenSize({ width: newWidth, height: newHeight });

            // Clamp position if window shrinks
            setPosition(prev => {
                const maxX = newWidth - 50; // Keep at least 50px visible
                const maxY = newHeight - 50;
                return {
                    x: Math.min(prev.x, maxX),
                    y: Math.min(prev.y, maxY)
                };
            });
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Dragging and Resizing logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                setPosition({ x: newX, y: newY });
                setWasDragging(true);
            }
            if (resizeDir) {
                const minWidth = 320;
                const minHeight = 300;

                // Get current DOM dimensions for accurate delta calculations
                const domRect = containerRef.current?.getBoundingClientRect();
                const currentDomWidth = domRect ? domRect.width : (size.width || 320);
                const currentDomHeight = domRect ? domRect.height : (size.height || 400);

                let nextWidth = size.width;
                let nextHeight = size.height;
                let nextX = position.x;
                let nextY = position.y;

                // Horizontal Resize
                if (resizeDir.includes('e')) {
                    nextWidth = Math.max(minWidth, e.clientX - position.x);
                } else if (resizeDir.includes('w')) {
                    const deltaX = e.clientX - position.x;
                    const potentialWidth = currentDomWidth - deltaX;
                    if (potentialWidth >= minWidth) {
                        nextWidth = potentialWidth;
                        nextX = e.clientX;
                    }
                }

                // Vertical Resize
                if (resizeDir.includes('s')) {
                    nextHeight = Math.max(minHeight, e.clientY - position.y);
                } else if (resizeDir.includes('n')) {
                    const deltaY = e.clientY - position.y;
                    const potentialHeight = currentDomHeight - deltaY;
                    if (potentialHeight >= minHeight) {
                        nextHeight = potentialHeight;
                        nextY = e.clientY;
                    }
                }

                setSize({ width: nextWidth, height: nextHeight });
                setPosition({ x: nextX, y: nextY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setResizeDir(null);
            setTimeout(() => setWasDragging(false), 50);
        };

        if (isDragging || resizeDir) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            // Prevent text selection during drag/resize
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        };
    }, [isDragging, resizeDir, dragOffset, position, size]);

    const handleMouseDown = (e: MouseEvent) => {
        if (dragRef.current && dragRef.current.contains(e.target as Node)) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const startResize = (e: MouseEvent, dir: string) => {
        e.stopPropagation();
        setResizeDir(dir);
    };

    // Mock Auth Toggle
    const toggleAuth = () => {
        const newValue = !mockAuth;
        setMockAuth(newValue);
        if (newValue) {
            localStorage.setItem('mock_auth_token', 'dev-token-123');
            console.log('[DevTools] Mock Auth Enabled');
        } else {
            localStorage.removeItem('mock_auth_token');
            console.log('[DevTools] Mock Auth Disabled');
        }
        refreshStorage();
        // Dispatch event for app to react
        window.dispatchEvent(new CustomEvent('devtools:auth-change', { detail: { authenticated: newValue } }));
    };

    // Fixture Toggle
    const toggleFixtures = () => {
        const newValue = !mockFixtures;
        setMockFixtures(newValue);
        window.dispatchEvent(new CustomEvent('devtools:fixture-change', { detail: { useFixtures: newValue } }));
        console.log(`[DevTools] Fixtures ${newValue ? 'Enabled' : 'Disabled'}`);
    };

    // Theme Toggle
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        if (document.body) document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        refreshStorage();
    };

    // Language Switcher
    const changeLanguage = (e: any) => {
        const newLang = e.target.value;
        const currentPath = window.location.pathname;
        let newPath = currentPath;
        const parts = currentPath.split('/');
        if (['pt', 'en', 'es'].includes(parts[1])) {
            parts[1] = newLang;
            newPath = parts.join('/');
        } else {
            newPath = `/${newLang}${currentPath}`;
        }
        window.location.href = newPath;
    };

    // Storage Actions
    const updateStorage = (type: 'local' | 'session' | 'cookie', key: string, value: string) => {
        if (type === 'local') {
            localStorage.setItem(key, value);
        } else if (type === 'session') {
            sessionStorage.setItem(key, value);
        } else {
            document.cookie = `${key}=${value}; path=/`;
        }
        refreshStorage();
    };

    const deleteStorage = (type: 'local' | 'session' | 'cookie', key: string) => {
        if (type === 'local') {
            localStorage.removeItem(key);
        } else if (type === 'session') {
            sessionStorage.removeItem(key);
        } else {
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        refreshStorage();
    };

    const addStorage = () => {
        if (!newStorageKey) return;
        updateStorage(newStorageType, newStorageKey, newStorageValue);
        setNewStorageKey('');
        setNewStorageValue('');
        setIsAddingStorage(false);
    };

    const duplicateStorage = (type: 'local' | 'session' | 'cookie', key: string, value: string) => {
        let newKey = `${key}_copy`;
        // Simple check against current list could be added here, but for now just appending copy
        updateStorage(type, newKey, value);
    };

    // I18n Highlight Logic
    const [isI18nHighlightActive, setIsI18nHighlightActive] = useState(() => {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('devtools_i18n_active') === 'true';
        }
        return false;
    });

    const scanAndHighlight = () => {
        if (!contentData || !contentData.ui || !contentData.config) return;

        const currentLang = contentData.config.defaultLang || 'pt';
        const supportedLangs = Object.keys(contentData.config.languages || {});
        const uiStrings = contentData.ui[currentLang] || {};

        const textToKey: Record<string, { key: string, type: 'ui' | 'tag' | 'category' }> = {};
        const regexToKey: { regex: RegExp, key: string, type: 'ui' }[] = [];

        // UI Strings
        Object.entries(uiStrings).forEach(([key, val]) => {
            if (typeof val === 'string') {
                if (val.includes('{')) {
                    const pattern = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{.*?\}/g, '.*');
                    regexToKey.push({ regex: new RegExp(`^${pattern}$`), key, type: 'ui' });
                } else {
                    textToKey[val] = { key, type: 'ui' };
                }
            }
        });

        // Tags
        if (contentData.definedTags) {
            Object.values(contentData.definedTags).forEach((tag: any) => {
                const name = typeof tag.name === 'object' ? tag.name[currentLang] : tag.name;
                if (name) textToKey[name] = { key: tag.id, type: 'tag' };
            });
        }

        // Categories
        if (contentData.definedCategories) {
            Object.values(contentData.definedCategories).forEach((cat: any) => {
                const name = typeof cat.name === 'object' ? cat.name[currentLang] : cat.name;
                if (name) textToKey[name] = { key: cat.id, type: 'category' };
            });
        }

        // Contrast Helpers
        const getLuminance = (r: number, g: number, b: number) => {
            const a = [r, g, b].map(v => {
                v /= 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        };

        const parseColor = (color: string) => {
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
            return null;
        };

        const getBackgroundColor = (el: HTMLElement): { r: number, g: number, b: number } | null => {
            let current: HTMLElement | null = el;
            while (current) {
                const style = window.getComputedStyle(current);
                const color = parseColor(style.backgroundColor);
                // Check if not transparent (alpha check is harder with just rgb regex, assuming simple case)
                if (color && (color.r !== 0 || color.g !== 0 || color.b !== 0 || style.backgroundColor !== 'rgba(0, 0, 0, 0)')) {
                    return color;
                }
                current = current.parentElement;
            }
            return { r: 255, g: 255, b: 255 }; // Default to white
        };

        // Content Strings (Titles, Descriptions) to Ignore
        const contentStrings = new Set<string>();
        if (contentData.posts) {
            contentData.posts.forEach((post: any) => {
                if (post.data.title) contentStrings.add(post.data.title.trim());
                if (post.data.description) contentStrings.add(post.data.description.trim());
            });
        }

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent?.trim();
            const parent = node.parentElement;

            if (!text || !parent) continue;

            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE'].includes(parent.tagName)) continue;
            if (parent.hasAttribute('data-i18n-key') || parent.hasAttribute('data-i18n-status')) continue;
            if (parent.closest('.blog-content')) continue;
            if (parent.closest('.toc-list')) continue;
            if (parent.closest('#devtools-container') || parent.closest('#devtools-minimized')) continue;

            // Calculate Contrast and Font Size
            // Calculate Contrast and Font Size
            if (parent instanceof HTMLElement) {
                const style = window.getComputedStyle(parent);
                const fontSizeStr = style.fontSize;
                const fontSize = parseFloat(fontSizeStr);

                const fg = parseColor(style.color);
                const bg = getBackgroundColor(parent);

                let issues = [];

                if (fontSize < 12) {
                    issues.push('small-font');
                    parent.setAttribute('data-font-size', fontSizeStr);
                }

                if (fg && bg) {
                    const l1 = getLuminance(fg.r, fg.g, fg.b);
                    const l2 = getLuminance(bg.r, bg.g, bg.b);
                    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

                    if (ratio < 4.5) {
                        issues.push('low-contrast');
                        parent.setAttribute('data-contrast', ratio.toFixed(2));
                    }
                }

                if (issues.length > 0) {
                    parent.setAttribute('data-a11y-issue', issues.join(' '));
                }
            }

            let match = textToKey[text];

            if (!match) {
                const regexMatch = regexToKey.find(r => r.regex.test(text));
                if (regexMatch) {
                    match = { key: regexMatch.key, type: regexMatch.type };
                }
            }

            if (match) {
                const { key, type } = match;
                let translatedCount = 0;

                if (type === 'ui') {
                    supportedLangs.forEach(lang => {
                        if (contentData.ui[lang] && contentData.ui[lang][key]) translatedCount++;
                    });
                } else if (type === 'tag') {
                    const tag = contentData.definedTags[key];
                    supportedLangs.forEach(lang => {
                        if (tag && typeof tag.name === 'object' && tag.name[lang]) translatedCount++;
                        else if (tag && typeof tag.name === 'string' && lang === contentData.config?.defaultLang) translatedCount++;
                    });
                } else if (type === 'category') {
                    const cat = contentData.definedCategories[key];
                    supportedLangs.forEach(lang => {
                        if (cat && typeof cat.name === 'object' && cat.name[lang]) translatedCount++;
                        else if (cat && typeof cat.name === 'string' && lang === contentData.config?.defaultLang) translatedCount++;
                    });
                }

                let status = 'missing';
                if (translatedCount === supportedLangs.length) status = 'complete';
                else if (translatedCount > 0) status = 'partial';

                parent.setAttribute('data-i18n-key', key);
                parent.setAttribute('data-i18n-status', status);
                parent.setAttribute('data-i18n-count', `${translatedCount}/${supportedLangs.length}`);
            } else {
                // Skip if it matches known content (title/description)
                if (contentStrings.has(text)) continue;

                if (text.length > 2 && isNaN(Number(text)) && !/^[\s\W]+$/.test(text)) {
                    parent.setAttribute('data-i18n-status', 'untranslated');
                }
            }
        }

        // Check for Aria Labels
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        interactiveElements.forEach(el => {
            if (el.closest('.blog-content')) return;
            if (el.closest('.toc-sidebar')) return;
            if (el.closest('#devtools-container') || el.closest('#devtools-minimized')) return;

            const ariaLabel = el.getAttribute('aria-label');
            const ariaLabelledBy = el.getAttribute('aria-labelledby');
            const hasText = el.textContent && el.textContent.trim().length > 0;

            if (!ariaLabel && !ariaLabelledBy && !hasText) {
                el.setAttribute('data-i18n-status', 'missing-aria');
            } else if (ariaLabel) {
                // Check if aria-label is translated
                let match = textToKey[ariaLabel];
                if (!match) {
                    const regexMatch = regexToKey.find(r => r.regex.test(ariaLabel));
                    if (regexMatch) {
                        match = { key: regexMatch.key, type: regexMatch.type };
                    }
                }

                if (!match) {
                    // Check if it's a known content string
                    if (!contentStrings.has(ariaLabel)) {
                        if (ariaLabel.length > 2 && isNaN(Number(ariaLabel))) {
                            el.setAttribute('data-i18n-status', 'untranslated-aria');
                        }
                    }
                }
            }
        });
        // Check for Links (UTM and Ref)
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (link.closest('#devtools-container') || link.closest('#devtools-minimized')) return;

            const href = link.getAttribute('href');
            if (!href) return;

            const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);

            if (isExternal) {
                const rel = link.getAttribute('rel');
                if (!rel || (!rel.includes('noopener') && !rel.includes('noreferrer'))) {
                    link.setAttribute('data-link-status', 'missing-ref');
                }

                if (!href.includes('utm_')) {
                    // Check if it already has a status, append if so
                    const currentStatus = link.getAttribute('data-link-status');
                    if (currentStatus) {
                        link.setAttribute('data-link-status', `${currentStatus} missing-utm`);
                    } else {
                        link.setAttribute('data-link-status', 'missing-utm');
                    }
                }
            }
        });
    };

    useEffect(() => {
        localStorage.setItem('devtools_i18n_active', String(isI18nHighlightActive));

        if (isI18nHighlightActive) {
            document.body.classList.add('i18n-highlight-active');
            if (!document.getElementById('i18n-highlight-styles')) {
                const style = document.createElement('style');
                style.id = 'i18n-highlight-styles';
                style.innerHTML = `
                    .i18n-highlight-active *[data-i18n-status="complete"] { outline: 2px solid #4ade80 !important; position: relative !important; }
                    .i18n-highlight-active *[data-i18n-status="partial"] { outline: 2px solid #eab308 !important; position: relative !important; }
                    .i18n-highlight-active *[data-i18n-status="missing"] { outline: 2px solid #ef4444 !important; position: relative !important; }
                    .i18n-highlight-active *[data-i18n-status="untranslated"] { outline: 2px dashed #a855f7 !important; position: relative !important; }
                    .i18n-highlight-active *[data-i18n-status="missing-aria"] { outline: 2px dashed #f43f5e !important; position: relative !important; }
                    .i18n-highlight-active *[data-i18n-status="untranslated-aria"] { outline: 2px dashed #ec4899 !important; position: relative !important; }
                    
                    /* Link Status Styles */
                    .i18n-highlight-active a[data-link-status~="missing-ref"] { border-bottom: 2px dotted #ef4444 !important; }
                    .i18n-highlight-active a[data-link-status~="missing-utm"] { border-bottom: 2px dotted #f59e0b !important; }
                    
                    /* Accessibility Issues */
                    .i18n-highlight-active *[data-a11y-issue] { outline: 2px dotted #f97316 !important; position: relative !important; }

                    .i18n-highlight-active *[data-i18n-key]:hover::after {
                        content: attr(data-i18n-key) " (" attr(data-i18n-count) ")";
                        position: absolute; top: -20px; left: 0; background: #1e1e1e; color: #fff; padding: 2px 6px; font-size: 10px; border-radius: 4px; z-index: 10000; white-space: nowrap; font-weight: bold; border: 1px solid #444; box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    }
                    .i18n-highlight-active *[data-i18n-status="untranslated"]:hover::after {
                        content: "Potentially Untranslated";
                        position: absolute; top: -20px; left: 0; background: #581c87; color: #fff; padding: 2px 6px; font-size: 10px; border-radius: 4px; z-index: 10000; white-space: nowrap; font-weight: bold; border: 1px solid #a855f7; box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    }
                    
                    /* A11y Issue Tooltip - Appends to existing or shows standalone */
                    .i18n-highlight-active *[data-a11y-issue]:hover::before {
                        content: "A11y Issue: " attr(data-a11y-issue) " | Size: " attr(data-font-size) " | Contrast: " attr(data-contrast);
                        position: absolute; bottom: -25px; left: 0; background: #c2410c; color: #fff; padding: 2px 6px; font-size: 10px; border-radius: 4px; z-index: 10001; white-space: nowrap; font-weight: bold; border: 1px solid #f97316; box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    }
                    .i18n-highlight-active *[data-i18n-status="missing-aria"]:hover::after {
                        content: "Missing Aria Label";
                        position: absolute; top: -20px; left: 0; background: #be123c; color: #fff; padding: 2px 6px; font-size: 10px; border-radius: 4px; z-index: 10000; white-space: nowrap; font-weight: bold; border: 1px solid #f43f5e; box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    }
                    .i18n-highlight-active *[data-i18n-status="untranslated-aria"]:hover::after {
                        content: "Untranslated Aria Label";
                        position: absolute; top: -20px; left: 0; background: #be185d; color: #fff; padding: 2px 6px; font-size: 10px; border-radius: 4px; z-index: 10000; white-space: nowrap; font-weight: bold; border: 1px solid #ec4899; box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    }
                    
                    /* Link Tooltips */
                    .i18n-highlight-active a[data-link-status]:hover::before {
                        content: attr(data-link-status);
                        position: absolute; bottom: -20px; left: 0; background: #1e1e1e; color: #fff; padding: 2px 6px; font-size: 10px; border-radius: 4px; z-index: 10000; white-space: nowrap; font-weight: bold; border: 1px solid #444; box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    }
                `;
                document.head.appendChild(style);
            }
            scanAndHighlight();
            const observer = new MutationObserver(() => { if (isI18nHighlightActive) scanAndHighlight(); });
            observer.observe(document.body, { childList: true, subtree: true });
            return () => observer.disconnect();
        } else {
            document.body.classList.remove('i18n-highlight-active');
        }

    }, [isI18nHighlightActive, contentData]);

    const toggleI18nHighlight = () => {
        const newState = !isI18nHighlightActive;
        setIsI18nHighlightActive(newState);
        if (newState) {
            setIsMinimized(true);
        }
    };

    if (!isVisible) return null;

    if (isMinimized) {
        return (
            <div
                id="devtools-minimized"
                ref={dragRef}
                onMouseDown={handleMouseDown as any}
                style={{
                    position: 'fixed',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    zIndex: 9999,
                    cursor: 'grab',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <button
                    onClick={() => {
                        if (!wasDragging) setIsMinimized(false);
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        const newTheme = theme === 'dark' ? 'light' : 'dark';
                        setTheme(newTheme);
                        document.documentElement.setAttribute('data-theme', newTheme);
                        if (newTheme === 'dark') {
                            document.documentElement.classList.add('dark');
                        } else {
                            document.documentElement.classList.remove('dark');
                        }
                        localStorage.setItem('theme', newTheme);
                    }}

                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#1e1e1e',
                        color: '#eab308',
                        border: '2px solid #eab308',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        padding: 0,
                    }}
                    title="Open DevTools"
                >
                    ⚡
                </button>
            </div >
        );
    }

    return (
        <div
            id="devtools-container"
            ref={containerRef}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 9999,
                backgroundColor: '#1e1e1e',
                color: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                fontFamily: 'monospace',
                fontSize: '13px',
                width: size.width ? `${size.width}px` : '320px',
                height: size.height ? `${size.height}px` : 'auto',
                border: '1px solid #333',
                maxHeight: size.height ? 'none' : '80vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header / Drag Handle */}
            <div
                ref={dragRef}
                onMouseDown={handleMouseDown as any}
                onContextMenu={(e) => {
                    e.preventDefault();
                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);
                    document.documentElement.setAttribute('data-theme', newTheme);
                    if (newTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    localStorage.setItem('theme', newTheme);
                }}
                style={{
                    padding: '8px 12px',
                    backgroundColor: '#2d2d2d',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    cursor: 'grab',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none',
                    flexShrink: 0,
                }}
            >
                <div
                    onClick={() => {
                        if (!wasDragging) setIsMinimized(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <span
                        style={{
                            backgroundColor: '#eab308',
                            color: '#000',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '11px',
                        }}
                    >
                        DEV
                    </span>
                    <span style={{ fontSize: '13px' }}>DevTools</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setIsMinimized(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '16px',
                            lineHeight: 1,
                        }}
                        title="Minimize"
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Stop propagation to header
                            const newTheme = theme === 'dark' ? 'light' : 'dark';
                            setTheme(newTheme);
                            document.documentElement.setAttribute('data-theme', newTheme);
                            if (newTheme === 'dark') {
                                document.documentElement.classList.add('dark');
                            } else {
                                document.documentElement.classList.remove('dark');
                            }
                            localStorage.setItem('theme', newTheme);
                        }}
                    >
                        _
                    </button>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            localStorage.setItem('devtools_visible', 'false');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '16px',
                            lineHeight: 1,
                        }}
                        title="Close"
                    >
                        ✕
                    </button>
                </div>
            </div >

            {/* Tabs */}
            < div style={{ display: 'flex', borderBottom: '1px solid #333', background: '#252525' }}>
                {
                    ['General', 'Routes', 'Storage', 'Content', 'SEO', 'Perf', 'Recs'].map(tab => {
                        const key = tab.toLowerCase() as any;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                style={{
                                    flex: 1,
                                    background: activeTab === key ? '#1e1e1e' : 'transparent',
                                    border: 'none',
                                    color: activeTab === key ? '#fff' : '#888',
                                    padding: '8px 4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    borderBottom: activeTab === key ? '2px solid #3b82f6' : 'none',
                                }}
                            >
                                {tab}
                            </button>
                        );
                    })
                }
            </div >

            {/* Content */}
            < div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column', minHeight: 0 }}>

                {/* General Tab */}
                {
                    activeTab === 'general' && (
                        <div style={{ padding: '12px', overflowY: 'auto' }}>
                            {/* Screen Info */}
                            <div style={{ marginBottom: '12px', color: '#888', fontSize: '12px' }}>
                                Viewport: {screenSize.width}px × {screenSize.height}px
                            </div>

                            {/* Environment Controls */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* Theme & Language */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={toggleTheme}
                                        style={{
                                            flex: 1,
                                            padding: '6px',
                                            background: '#333',
                                            border: '1px solid #444',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
                                        {theme === 'dark' ? 'Dark' : 'Light'}
                                    </button>
                                    <select
                                        value={currentLang}
                                        onChange={changeLanguage}
                                        style={{
                                            flex: 1,
                                            padding: '6px',
                                            background: '#333',
                                            border: '1px solid #444',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        <option value="pt">🇵🇹 PT</option>
                                        <option value="en">🇺🇸 EN</option>
                                        <option value="es">🇪🇸 ES</option>
                                    </select>
                                </div>

                                <div style={{ height: '1px', background: '#333' }} />

                                {/* Toggles */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={mockAuth}
                                        onChange={toggleAuth}
                                        style={{ accentColor: '#3b82f6' }}
                                    />
                                    Mock Authentication
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={mockFixtures}
                                        onChange={toggleFixtures}
                                        style={{ accentColor: '#10b981' }}
                                    />
                                    Use Fixture Data
                                </label>
                            </div>
                        </div>
                    )
                }

                {/* Routes Tab */}
                {
                    activeTab === 'routes' && (
                        <div style={{ padding: '8px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {routes.length === 0 ? (
                                <div style={{ color: '#666', padding: '10px', textAlign: 'center' }}>Loading routes...</div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <button
                                            onClick={() => setTreeState({ action: 'expand', actionId: Date.now() })}
                                            style={{ background: '#333', border: '1px solid #444', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer' }}
                                        >
                                            Expand All
                                        </button>
                                        <button
                                            onClick={() => setTreeState({ action: 'collapse', actionId: Date.now() })}
                                            style={{ background: '#333', border: '1px solid #444', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer' }}
                                        >
                                            Collapse All
                                        </button>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto' }}>

                                        <TreeContext.Provider value={treeState}>
                                            <RouteNode node={buildTree(routes)} depth={0} />
                                        </TreeContext.Provider>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                }

                {/* Storage Tab */}
                {
                    activeTab === 'storage' && (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            <div style={{
                                padding: '8px',
                                borderBottom: '1px solid #333',
                                background: '#252525',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setIsAddingStorage(true)}
                                            style={{ background: '#3b82f6', border: 'none', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            + Add Item
                                        </button>
                                        <button
                                            onClick={() => setStorageTreeState({ type: 'expand', id: Date.now() })}
                                            style={{ background: '#333', border: '1px solid #444', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '2px', cursor: 'pointer' }}
                                        >
                                            Expand All
                                        </button>
                                        <button
                                            onClick={() => setStorageTreeState({ type: 'collapse', id: Date.now() })}
                                            style={{ background: '#333', border: '1px solid #444', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '2px', cursor: 'pointer' }}
                                        >
                                            Collapse All
                                        </button>
                                    </div>
                                    <button
                                        onClick={refreshStorage}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '12px' }}
                                        title="Refresh"
                                    >
                                        ↻ Refresh
                                    </button>
                                </div>

                                {isAddingStorage && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#1e1e1e', padding: '8px', borderRadius: '4px', border: '1px solid #333' }}>
                                        <select
                                            value={newStorageType}
                                            onChange={(e) => setNewStorageType((e.target as HTMLSelectElement).value as any)}
                                            style={{ background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '2px', fontSize: '11px', padding: '2px' }}
                                        >
                                            <option value="local">Local</option>
                                            <option value="session">Session</option>
                                            <option value="cookie">Cookie</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Key"
                                            value={newStorageKey}
                                            onChange={(e) => setNewStorageKey((e.target as HTMLInputElement).value)}
                                            autoComplete="off"
                                            style={{ background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '2px', fontSize: '11px', padding: '2px 4px', flex: 1, minWidth: '120px' }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Value"
                                            value={newStorageValue}
                                            onChange={(e) => setNewStorageValue((e.target as HTMLInputElement).value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addStorage()}
                                            autoComplete="off"
                                            style={{ background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '2px', fontSize: '11px', padding: '2px 4px', flex: 2, minWidth: '150px' }}
                                        />
                                        <button onClick={addStorage} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✓</button>
                                        <button onClick={() => setIsAddingStorage(false)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>×</button>
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                                {storageItems.length === 0 ? (
                                    <div style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>Empty</div>
                                ) : (
                                    storageItems.map((item, idx) => (
                                        <StorageItemEditor
                                            key={`${item.type}-${item.key}`}
                                            item={item}
                                            onUpdate={updateStorage}
                                            onDelete={deleteStorage}
                                            onDuplicate={duplicateStorage}
                                            storageTreeState={storageTreeState}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Content Tab */}
                {
                    activeTab === 'content' && (
                        <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
                            {!contentData ? (
                                <div style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>Loading content data...</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Configuration */}
                                    {contentData.config && (
                                        <div style={{ padding: '8px', background: '#252525', borderRadius: '4px', border: '1px solid #333' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>⚙️ Config</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px', fontSize: '12px' }}>
                                                <div style={{ color: '#888' }}>Default Lang:</div>
                                                <div style={{ color: '#eab308', fontFamily: 'monospace' }}>{contentData.config.defaultLang}</div>
                                                <div style={{ color: '#888' }}>Supported:</div>
                                                <div style={{ color: '#ccc' }}>
                                                    {Object.entries(contentData.config.languages || {}).map(([code, name]: any) => (
                                                        <span key={code} style={{ marginRight: '8px' }}>
                                                            <span style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>{code}</span> <span style={{ color: '#666', fontSize: '11px' }}>({name})</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* I18n Matrix */}
                                    <div>
                                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff', fontSize: '13px', borderBottom: '1px solid #333', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Internationalization Status</span>
                                            <button
                                                onClick={toggleI18nHighlight}
                                                style={{
                                                    background: isI18nHighlightActive ? '#eab308' : '#333',
                                                    color: isI18nHighlightActive ? '#000' : '#ccc',
                                                    border: '1px solid #444',
                                                    borderRadius: '4px',
                                                    padding: '2px 8px',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {isI18nHighlightActive ? 'Disable Highlight' : 'Highlight I18n'}
                                            </button>
                                        </div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', color: '#888' }}>
                                                    <th style={{ padding: '4px', borderBottom: '1px solid #333' }}>Permalink</th>
                                                    {Object.keys(contentData.config?.languages || {}).map((lang: any) => {
                                                        // Calculate post stats
                                                        const groupedPosts = Object.values(contentData.posts.reduce((acc: any, post: any) => {
                                                            const ownPermalink = post.data.permalink || post.id;
                                                            const altPermalinks = post.data.alternates ? Object.values(post.data.alternates) : [];
                                                            const allPermalinks = [...new Set([ownPermalink, ...altPermalinks])].sort();
                                                            const groupKey = allPermalinks.join('|');
                                                            if (!acc[groupKey]) acc[groupKey] = {};
                                                            acc[groupKey][post.data.lang] = true;
                                                            return acc;
                                                        }, {}));

                                                        const totalGroups = groupedPosts.length;
                                                        const translatedCount = groupedPosts.filter((group: any) => group[lang]).length;
                                                        const percent = totalGroups > 0 ? Math.round((translatedCount / totalGroups) * 100) : 0;
                                                        const color = percent === 100 ? '#4ade80' : percent > 50 ? '#eab308' : '#ef4444';

                                                        return (
                                                            <th key={lang} style={{ padding: '6px', borderBottom: '1px solid #333', minWidth: '40px', textAlign: 'center', borderLeft: '1px solid #333' }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                                                                    <span>{lang.toUpperCase()}</span>
                                                                    <span style={{ fontSize: '9px', color: color, fontWeight: 'normal' }}>
                                                                        {translatedCount}/{totalGroups}
                                                                    </span>
                                                                </div>
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(contentData.posts.reduce((acc: any, post: any) => {
                                                    // Group by connected permalinks (using alternates)
                                                    const ownPermalink = post.data.permalink || post.id;
                                                    const altPermalinks = post.data.alternates ? Object.values(post.data.alternates) : [];
                                                    // Create a unique key for the group by sorting all related permalinks
                                                    const allPermalinks = [...new Set([ownPermalink, ...altPermalinks])].sort();
                                                    const groupKey = allPermalinks.join('|');

                                                    if (!acc[groupKey]) {
                                                        acc[groupKey] = {
                                                            pt: false,
                                                            en: false,
                                                            es: false,
                                                            displayLabel: ownPermalink // Use the first encountered permalink as label
                                                        };
                                                    }
                                                    acc[groupKey][post.data.lang] = true;
                                                    return acc;
                                                }, {})).map(([groupKey, data]: any) => (
                                                    <tr key={groupKey} style={{ borderBottom: '1px solid #222' }}>
                                                        <td style={{ padding: '4px', color: '#ccc' }} title={groupKey}>
                                                            {data.displayLabel}
                                                        </td>
                                                        <td style={{ padding: '4px', textAlign: 'center', color: data.pt ? '#4ade80' : '#ef4444' }}>{data.pt ? '✓' : '•'}</td>
                                                        <td style={{ padding: '4px', textAlign: 'center', color: data.en ? '#4ade80' : '#ef4444' }}>{data.en ? '✓' : '•'}</td>
                                                        <td style={{ padding: '4px', textAlign: 'center', color: data.es ? '#4ade80' : '#ef4444' }}>{data.es ? '✓' : '•'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff', fontSize: '13px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                                            Defined Tags ({Object.keys(contentData.definedTags || {}).length})
                                        </div>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #333', borderRadius: '4px', background: '#111' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                                <thead style={{ position: 'sticky', top: 0, background: '#252525', zIndex: 1 }}>
                                                    <tr style={{ textAlign: 'left', color: '#888' }}>
                                                        <th style={{ padding: '6px 8px', borderBottom: '1px solid #333' }}>ID</th>
                                                        {Object.keys(contentData.config?.languages || {}).map((lang: any) => {
                                                            const total = Object.keys(contentData.definedTags || {}).length;
                                                            const translated = Object.values(contentData.definedTags || {}).filter((tag: any) =>
                                                                typeof tag.name === 'object' ? !!tag.name[lang] : (lang === contentData.config?.defaultLang)
                                                            ).length;
                                                            const percent = total > 0 ? Math.round((translated / total) * 100) : 0;
                                                            const color = percent === 100 ? '#4ade80' : percent >= 50 ? '#eab308' : '#ef4444';

                                                            return (
                                                                <th key={lang} style={{ padding: '6px', borderBottom: '1px solid #333', textAlign: 'center', borderLeft: '1px solid #333' }}>
                                                                    <div>{lang.toUpperCase()}</div>
                                                                    <div style={{ fontSize: '9px', color, marginTop: '2px' }}>
                                                                        {translated}/{total}
                                                                    </div>
                                                                </th>
                                                            );
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.values(contentData.definedTags || {}).map((tag: any) => (
                                                        <tr key={tag.id} style={{ borderBottom: '1px solid #222' }}>
                                                            <td style={{ padding: '4px 8px', color: '#ccc' }}>{tag.id}</td>
                                                            {Object.keys(contentData.config?.languages || {}).map((lang: any) => {
                                                                const hasTranslation = typeof tag.name === 'object' ? !!tag.name[lang] : (lang === contentData.config?.defaultLang);
                                                                const val = typeof tag.name === 'object' ? tag.name[lang] : (lang === contentData.config?.defaultLang ? tag.name : '');
                                                                return (
                                                                    <td key={lang} style={{ padding: '4px', textAlign: 'center', color: hasTranslation ? '#4ade80' : '#ef4444', borderLeft: '1px solid #333', background: hasTranslation ? 'transparent' : 'rgba(239, 68, 68, 0.1)' }} title={val}>
                                                                        {hasTranslation ? '✓' : '•'}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    <div>
                                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff', fontSize: '13px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                                            Defined Categories ({Object.keys(contentData.definedCategories || {}).length})
                                        </div>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #333', borderRadius: '4px', background: '#111' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                                <thead style={{ position: 'sticky', top: 0, background: '#252525', zIndex: 1 }}>
                                                    <tr style={{ textAlign: 'left', color: '#888' }}>
                                                        <th style={{ padding: '6px 8px', borderBottom: '1px solid #333' }}>ID</th>
                                                        {Object.keys(contentData.config?.languages || {}).map((lang: any) => {
                                                            const total = Object.keys(contentData.definedCategories || {}).length;
                                                            const translated = Object.values(contentData.definedCategories || {}).filter((cat: any) =>
                                                                typeof cat.name === 'object' ? !!cat.name[lang] : (lang === contentData.config?.defaultLang)
                                                            ).length;
                                                            const percent = total > 0 ? Math.round((translated / total) * 100) : 0;
                                                            const color = percent === 100 ? '#4ade80' : percent >= 50 ? '#eab308' : '#ef4444';

                                                            return (
                                                                <th key={lang} style={{ padding: '6px', borderBottom: '1px solid #333', textAlign: 'center', borderLeft: '1px solid #333' }}>
                                                                    <div>{lang.toUpperCase()}</div>
                                                                    <div style={{ fontSize: '9px', color, marginTop: '2px' }}>
                                                                        {translated}/{total}
                                                                    </div>
                                                                </th>
                                                            );
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.values(contentData.definedCategories || {}).map((cat: any) => (
                                                        <tr key={cat.id} style={{ borderBottom: '1px solid #222' }}>
                                                            <td style={{ padding: '4px 8px', color: '#ccc' }}>
                                                                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: cat.color || '#666', marginRight: '6px' }}></span>
                                                                {cat.id}
                                                            </td>
                                                            {Object.keys(contentData.config?.languages || {}).map((lang: any) => {
                                                                const hasTranslation = typeof cat.name === 'object' ? !!cat.name[lang] : (lang === contentData.config?.defaultLang);
                                                                const val = typeof cat.name === 'object' ? cat.name[lang] : (lang === contentData.config?.defaultLang ? cat.name : '');
                                                                return (
                                                                    <td key={lang} style={{ padding: '4px', textAlign: 'center', color: hasTranslation ? '#4ade80' : '#ef4444', borderLeft: '1px solid #333', background: hasTranslation ? 'transparent' : 'rgba(239, 68, 68, 0.1)' }} title={val}>
                                                                        {hasTranslation ? '✓' : '•'}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* UI Translations */}
                                    {contentData.ui && (
                                        <div>
                                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff', fontSize: '13px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                                                UI Translations ({Object.keys(contentData.ui[contentData.config?.defaultLang || 'pt'] || {}).length})
                                            </div>
                                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #333', borderRadius: '4px', background: '#111' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                                    <thead style={{ position: 'sticky', top: 0, background: '#252525', zIndex: 1 }}>
                                                        <tr style={{ textAlign: 'left', color: '#888' }}>
                                                            <th style={{ padding: '6px 8px', borderBottom: '1px solid #333' }}>Key</th>
                                                            {Object.keys(contentData.config?.languages || {}).map((lang: any) => {
                                                                const totalKeys = Object.keys(contentData.ui[contentData.config?.defaultLang || 'pt'] || {}).length;
                                                                const translatedCount = Object.keys(contentData.ui[contentData.config?.defaultLang || 'pt'] || {}).filter(key => !!contentData.ui[lang]?.[key]).length;
                                                                const percent = Math.round((translatedCount / totalKeys) * 100);
                                                                const color = percent === 100 ? '#4ade80' : percent > 50 ? '#eab308' : '#ef4444';

                                                                return (
                                                                    <th key={lang} style={{ padding: '6px', borderBottom: '1px solid #333', minWidth: '60px', textAlign: 'center', borderLeft: '1px solid #333' }}>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                                                                            <span>{lang.toUpperCase()}</span>
                                                                            <span style={{ fontSize: '9px', color: color, fontWeight: 'normal' }}>
                                                                                {translatedCount}/{totalKeys}
                                                                            </span>
                                                                        </div>
                                                                    </th>
                                                                );
                                                            })}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(contentData.ui[contentData.config?.defaultLang || 'pt'] || {}).sort().map((key: string) => (
                                                            <tr key={key} style={{ borderBottom: '1px solid #222' }}>
                                                                <td style={{ padding: '4px 8px', color: '#ccc', fontFamily: 'monospace' }} title={key}>{key}</td>
                                                                {Object.keys(contentData.config?.languages || {}).map((lang: any) => {
                                                                    const hasTranslation = !!contentData.ui[lang]?.[key];
                                                                    return (
                                                                        <td key={lang} style={{ padding: '4px', textAlign: 'center', color: hasTranslation ? '#4ade80' : '#ef4444', borderLeft: '1px solid #333', background: hasTranslation ? 'transparent' : 'rgba(239, 68, 68, 0.1)' }}>
                                                                            {hasTranslation ? '✓' : '•'}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Recs Tab */}
                {activeTab === 'recs' && (
                    <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff' }}>Recommendation Debugger</h3>
                        {(() => {
                            // 1. Identify Current Post
                            const currentPath = window.location.pathname;
                            const pathParts = currentPath.split('/').filter(Boolean);
                            const currentSlug = pathParts.length >= 3 && pathParts[1] === 'blog' ? pathParts[2] : null;
                            const currentLang = pathParts.length >= 1 ? pathParts[0] : 'pt';

                            if (!currentSlug) {
                                return <div style={{ color: '#888' }}>Not on a blog post page. Navigate to a post to see recommendations.</div>;
                            }

                            if (!contentData || !contentData.posts) {
                                return <div style={{ color: '#888' }}>Loading content data...</div>;
                            }

                            const currentPost = contentData.posts.find((p: any) =>
                                p.data.permalink === currentSlug && p.data.lang === currentLang
                            );

                            if (!currentPost) {
                                return <div style={{ color: '#ef4444' }}>Current post not found in content data. Slug: {currentSlug}, Lang: {currentLang}</div>;
                            }

                            // 2. Calculate Scores for All Other Posts
                            const candidates = contentData.posts.filter((p: any) =>
                                p.data.lang === currentLang && p.id !== currentPost.id
                            );

                            const scoredCandidates = candidates.map((p: any) => {
                                let score = 0;
                                let breakdown = [];

                                // Category Match
                                if (p.data.category === currentPost.data.category) {
                                    score += 5;
                                    breakdown.push('Category (+5)');
                                }

                                // Tags Match
                                if (currentPost.data.tags && p.data.tags) {
                                    const commonTags = p.data.tags.filter((tag: any) => currentPost.data.tags.includes(tag));
                                    if (commonTags.length > 0) {
                                        const points = commonTags.length * 2;
                                        score += points;
                                        breakdown.push(`Tags: ${commonTags.length} (+${points})`);
                                    }
                                }

                                // Recency
                                const dateP = new Date(p.data.pubDate);
                                const dateCurrent = new Date(currentPost.data.pubDate);
                                if (dateP > dateCurrent) {
                                    score += 1;
                                    breakdown.push('Newer (+1)');
                                }

                                return { ...p, _score: score, _breakdown: breakdown };
                            });

                            // 3. Sort
                            scoredCandidates.sort((a: any, b: any) => {
                                if (a._score !== b._score) return b._score - a._score;
                                return new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf();
                            });

                            return (
                                <>
                                    <div style={{ marginBottom: '16px', padding: '12px', background: '#252525', borderRadius: '4px', border: '1px solid #333' }}>
                                        <div style={{ color: '#aaa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Post</div>
                                        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', margin: '4px 0' }}>{currentPost.data.title}</div>
                                        <div style={{ color: '#888', fontSize: '11px' }}>
                                            <span style={{ color: '#eab308' }}>Category:</span> {currentPost.data.category} <span style={{ margin: '0 8px', color: '#444' }}>|</span> <span style={{ color: '#eab308' }}>Tags:</span> {currentPost.data.tags?.join(', ')}
                                        </div>
                                    </div>

                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: '#888', borderBottom: '1px solid #444' }}>
                                                <th style={{ padding: '8px 4px' }}>Rank</th>
                                                <th style={{ padding: '8px 4px' }}>Title</th>
                                                <th style={{ padding: '8px 4px', textAlign: 'center' }}>Score</th>
                                                <th style={{ padding: '8px 4px' }}>Breakdown</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scoredCandidates.map((p: any, idx: number) => (
                                                <tr key={p.id} style={{ borderBottom: '1px solid #222', background: idx < 3 ? 'rgba(14, 165, 233, 0.05)' : 'transparent' }}>
                                                    <td style={{ padding: '8px 4px', color: idx < 3 ? '#0ea5e9' : '#666', fontWeight: idx < 3 ? 'bold' : 'normal' }}>
                                                        #{idx + 1}
                                                    </td>
                                                    <td style={{ padding: '8px 4px', color: '#ccc' }}>
                                                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{p.data.title}</div>
                                                        <div style={{ fontSize: '10px', color: '#666', fontFamily: 'monospace' }}>{p.data.permalink}</div>
                                                    </td>
                                                    <td style={{ padding: '8px 4px', fontWeight: 'bold', color: p._score > 0 ? '#4ade80' : '#888', textAlign: 'center', fontSize: '14px' }}>
                                                        {p._score}
                                                    </td>
                                                    <td style={{ padding: '8px 4px', color: '#888', fontSize: '11px' }}>
                                                        {p._breakdown.length > 0 ? p._breakdown.join(', ') : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* SEO Tab */}
                {
                    activeTab === 'seo' && seoData && (
                        <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>Title</div>
                                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{seoData.title}</div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>Canonical</div>
                                <div style={{ color: '#60a5fa', wordBreak: 'break-all', fontSize: '12px' }}>{seoData.canonical}</div>
                            </div>

                            <div style={{ height: '1px', background: '#333', margin: '12px 0' }} />

                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#aaa', fontSize: '12px' }}>Meta Tags</div>
                            {Object.entries(seoData.meta).map(([key, value]: any) => (
                                <div key={key} style={{ marginBottom: '8px', fontSize: '12px' }}>
                                    <span style={{ color: '#eab308' }}>{key}</span>: <span style={{ color: '#ccc' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    )
                }

                {/* Performance Tab */}
                {
                    activeTab === 'perf' && perfData && (
                        <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ background: '#252525', padding: '8px', borderRadius: '4px' }}>
                                    <div style={{ color: '#888', fontSize: '11px' }}>Load Time</div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{perfData.loadTime}ms</div>
                                </div>
                                <div style={{ background: '#252525', padding: '8px', borderRadius: '4px' }}>
                                    <div style={{ color: '#888', fontSize: '11px' }}>DOM Ready</div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>{perfData.domReady}ms</div>
                                </div>
                            </div>

                            {perfData.memory && (
                                <div style={{ marginTop: '12px', background: '#252525', padding: '8px', borderRadius: '4px' }}>
                                    <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>JS Heap Memory</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f472b6' }}>{perfData.memory.used} MB</span>
                                        <span style={{ color: '#666', fontSize: '11px' }}>/ {perfData.memory.limit} MB</span>
                                    </div>
                                    <div style={{
                                        height: '4px',
                                        background: '#333',
                                        borderRadius: '2px',
                                        marginTop: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(perfData.memory.used / perfData.memory.limit) * 100}%`,
                                            background: '#f472b6'
                                        }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >

            {/* Resize Handles */}
            {
                ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((dir) => (
                    <div
                        key={dir}
                        onMouseDown={(e) => startResize(e as any, dir)}
                        style={{
                            position: 'absolute',
                            top: dir.includes('n') ? 0 : dir.includes('s') ? 'auto' : 0,
                            bottom: dir.includes('s') ? 0 : dir.includes('n') ? 'auto' : 0,
                            left: dir.includes('w') ? 0 : dir.includes('e') ? 'auto' : 0,
                            right: dir.includes('e') ? 0 : dir.includes('w') ? 'auto' : 0,
                            width: dir === 'n' || dir === 's' ? '100%' : '6px',
                            height: dir === 'e' || dir === 'w' ? '100%' : '6px',
                            cursor: `${dir}-resize`,
                            zIndex: 10,
                            backgroundColor: 'transparent',
                        }}
                    />
                ))
            }
        </div >
    );
};

export default DevTools;
