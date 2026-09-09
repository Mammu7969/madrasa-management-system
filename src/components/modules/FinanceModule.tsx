import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { FinanceTransaction, FinanceCategoryItem } from '../../types';
import { exportToExcelTable } from '../../utils/excelExport';
import { 
  TrendingUp, Plus, Download, Printer, Filter, Search, 
  Trash2, Edit3, Tag, FolderPlus, Check, X, ArrowUpRight, 
  ArrowDownRight, Wallet, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const FinanceModule: React.FC = () => {
  const { activeMadrasa } = useAuth();
  const { showToast } = useTheme();

  // State
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => 
    db.getFinanceTransactions(activeMadrasa?.id)
  );
  const [categories, setCategories] = useState<FinanceCategoryItem[]>(() => 
    db.getFinanceCategories(activeMadrasa?.id)
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');

  // Add / Edit Transaction Modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txParticular, setTxParticular] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txSubcategory, setTxSubcategory] = useState('');
  const [txReceiptNo, setTxReceiptNo] = useState('');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txPaymentMode, setTxPaymentMode] = useState<FinanceTransaction['paymentMode']>('Cash');
  const [txNotes, setTxNotes] = useState('');

  // Manage Categories Modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatUrdu, setNewCatUrdu] = useState('');
  const [newCatType, setNewCatType] = useState<'Income' | 'Expense' | 'Both'>('Income');
  const [newCatInitialSub, setNewCatInitialSub] = useState('');
  
  // Quick subcategory adder per category in modal
  const [activeSubcatInputId, setActiveSubcatInputId] = useState<string | null>(null);
  const [newSubcatText, setNewSubcatText] = useState('');

  // Quick inline add category
  const [quickAddCatOpen, setQuickAddCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatUrdu, setQuickCatUrdu] = useState('');

  // Quick inline add subcategory
  const [quickAddSubOpen, setQuickAddSubOpen] = useState(false);
  const [quickSubName, setQuickSubName] = useState('');

  // Sync state with DB
  const refreshData = () => {
    setTransactions(db.getFinanceTransactions(activeMadrasa?.id));
    setCategories(db.getFinanceCategories(activeMadrasa?.id));
  };

  // Available subcategories for currently chosen transaction category
  const currentCategoryObj = useMemo(() => {
    return categories.find(c => c.name === txCategory);
  }, [categories, txCategory]);

  const availableSubcategories = useMemo(() => {
    if (!currentCategoryObj) return [];
    return currentCategoryObj.subcategories;
  }, [currentCategoryObj]);

  // Calculations
  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'Income').reduce((s, t) => s + (t.incomeAmount || 0), 0),
    [transactions]
  );

  const totalExpense = useMemo(() => 
    transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.expenseAmount || 0), 0),
    [transactions]
  );

  const netBalance = totalIncome - totalExpense;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchQuery = 
        t.particular.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subcategory.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = filterCategory === 'All' || t.category === filterCategory;
      const matchType = filterType === 'All' || t.type === filterType;

      return matchQuery && matchCategory && matchType;
    });
  }, [transactions, searchQuery, filterCategory, filterType]);

  // Open modal for new voucher
  const handleOpenNewVoucher = (defaultType: 'Income' | 'Expense' = 'Income') => {
    setEditingTxId(null);
    setTxType(defaultType);
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxParticular('');
    
    // Select first matching category
    const matchingCats = categories.filter(c => c.type === defaultType || c.type === 'Both');
    const firstCat = matchingCats[0]?.name || '';
    setTxCategory(firstCat);
    setTxSubcategory(matchingCats[0]?.subcategories[0] || '');

    const prefix = defaultType === 'Income' ? 'RCP' : 'EXP';
    const randNum = Math.floor(100 + Math.random() * 900);
    setTxReceiptNo(`${prefix}-2026-${randNum}`);
    setTxAmount('');
    setTxPaymentMode('Cash');
    setTxNotes('');
    setShowVoucherModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (tx: FinanceTransaction) => {
    setEditingTxId(tx.id);
    setTxType(tx.type);
    setTxDate(tx.date);
    setTxParticular(tx.particular);
    setTxCategory(tx.category);
    setTxSubcategory(tx.subcategory);
    setTxReceiptNo(tx.receiptNo);
    setTxAmount(tx.type === 'Income' ? tx.incomeAmount : tx.expenseAmount);
    setTxPaymentMode(tx.paymentMode);
    setTxNotes(tx.notes || '');
    setShowVoucherModal(true);
  };

  // Handle Save Transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txParticular.trim()) {
      showToast('Please enter Particular / Description (تفصیل)', 'error');
      return;
    }
    const numAmount = Number(txAmount);
    if (!numAmount || numAmount <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }

    if (editingTxId) {
      // Update existing
      db.updateFinanceTransaction(editingTxId, {
        date: txDate,
        particular: txParticular.trim(),
        category: txCategory,
        subcategory: txSubcategory,
        receiptNo: txReceiptNo.trim(),
        type: txType,
        incomeAmount: txType === 'Income' ? numAmount : 0,
        expenseAmount: txType === 'Expense' ? numAmount : 0,
        paymentMode: txPaymentMode,
        notes: txNotes.trim()
      });
      showToast('Voucher updated successfully! (واؤچر اپڈیٹ ہو گیا)', 'success');
    } else {
      // Create new
      db.addFinanceTransaction({
        date: txDate,
        particular: txParticular.trim(),
        category: txCategory,
        subcategory: txSubcategory,
        receiptNo: txReceiptNo.trim() || `VCH-${Date.now().toString().slice(-4)}`,
        type: txType,
        incomeAmount: txType === 'Income' ? numAmount : 0,
        expenseAmount: txType === 'Expense' ? numAmount : 0,
        paymentMode: txPaymentMode,
        madrasaId: activeMadrasa?.id,
        notes: txNotes.trim()
      });
      showToast(`${txType} voucher of ₹${numAmount.toLocaleString()} recorded!`, 'success');
    }

    refreshData();
    setShowVoucherModal(false);
  };

  // Handle Delete
  const handleDeleteTransaction = (id: string, particular: string) => {
    if (window.confirm(`Are you sure you want to delete voucher "${particular}"?`)) {
      db.deleteFinanceTransaction(id);
      refreshData();
      showToast('Voucher deleted from ledger', 'info');
    }
  };

  // Handle Add Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    const initialSubs = newCatInitialSub.trim() ? [newCatInitialSub.trim()] : ['General (عمومی)'];
    db.addFinanceCategory({
      name: newCatName.trim(),
      nameUrdu: newCatUrdu.trim() || newCatName.trim(),
      type: newCatType,
      subcategories: initialSubs,
      madrasaId: activeMadrasa?.id
    });
    setNewCatName('');
    setNewCatUrdu('');
    setNewCatInitialSub('');
    refreshData();
    showToast(`New category "${newCatName}" added successfully!`, 'success');
  };

  // Handle Add Subcategory
  const handleAddSubcategory = (catId: string) => {
    if (!newSubcatText.trim()) return;
    db.addFinanceSubcategory(catId, newSubcatText.trim());
    setNewSubcatText('');
    setActiveSubcatInputId(null);
    refreshData();
    showToast('Subcategory added!', 'success');
  };

  // Inline quick category add
  const handleQuickAddCategory = () => {
    if (!quickCatName.trim()) return;
    const newCat = db.addFinanceCategory({
      name: quickCatName.trim(),
      nameUrdu: quickCatUrdu.trim() || quickCatName.trim(),
      type: txType,
      subcategories: ['General (عمومی)'],
      madrasaId: activeMadrasa?.id
    });
    refreshData();
    setTxCategory(newCat.name);
    setTxSubcategory('General (عمومی)');
    setQuickCatName('');
    setQuickCatUrdu('');
    setQuickAddCatOpen(false);
    showToast(`Category "${newCat.name}" added!`, 'success');
  };

  // Inline quick subcategory add
  const handleQuickAddSubcategory = () => {
    if (!quickSubName.trim() || !txCategory) return;
    db.addFinanceSubcategory(txCategory, quickSubName.trim());
    refreshData();
    setTxSubcategory(quickSubName.trim());
    setQuickSubName('');
    setQuickAddSubOpen(false);
    showToast(`Subcategory added to ${txCategory}!`, 'success');
  };

  // Export to Excel with Excel-style Table Formatting
  const handleExportExcel = () => {
    const columns = [
      { header: 'S.No (نمبر شمار)', key: 'sNo', align: 'center' as const },
      { header: 'Date (تاریخ)', key: 'date', align: 'center' as const },
      { header: 'Particular (تفصیل و بابت)', key: 'particular', align: 'left' as const },
      { header: 'Category (مد)', key: 'category', align: 'left' as const },
      { header: 'Subcategory (ذیلی مد)', key: 'subcategory', align: 'left' as const },
      { header: 'Receipt No (رسید نمبر)', key: 'receiptNo', align: 'center' as const },
      { header: 'Income ₹ (آمدنی)', key: 'incomeDisplay', align: 'right' as const },
      { header: 'Expense ₹ (اخراجات)', key: 'expenseDisplay', align: 'right' as const },
      { header: 'Balance ₹ (بقایا نقد)', key: 'balanceDisplay', align: 'right' as const },
      { header: 'Payment Mode (طریقہ ادائیگی)', key: 'paymentMode', align: 'center' as const }
    ];

    const data = filteredTransactions.map(t => ({
      sNo: t.sNo,
      date: t.date,
      particular: t.particular,
      category: t.category,
      subcategory: t.subcategory,
      receiptNo: t.receiptNo,
      incomeDisplay: t.incomeAmount > 0 ? t.incomeAmount.toLocaleString() : '-',
      expenseDisplay: t.expenseAmount > 0 ? t.expenseAmount.toLocaleString() : '-',
      balanceDisplay: t.balance.toLocaleString(),
      paymentMode: t.paymentMode
    }));

    const totals = {
      particular: 'Total / کل میزان',
      incomeDisplay: totalIncome.toLocaleString(),
      expenseDisplay: totalExpense.toLocaleString(),
      balanceDisplay: netBalance.toLocaleString()
    };

    exportToExcelTable({
      filename: `Finance_Ledger_${new Date().toISOString().split('T')[0]}`,
      title: 'Income & Expenditures Cashbook Ledger (آمدنی و اخراجات کا مکمل رجسٹر)',
      madrasaName: activeMadrasa ? `${activeMadrasa.name} (${activeMadrasa.nameUrdu})` : 'Madrasa Management System',
      metadata: {
        'Financial Year': '2026-2027',
        'Total Vouchers': filteredTransactions.length,
        'Filter Category': filterCategory,
        'Filter Type': filterType
      },
      columns,
      data,
      totals
    });

    showToast('Ledger exported as Excel spreadsheet (.csv) with UTF-8 BOM!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>Income & Expenditures Ledger</span>
                <span className="text-emerald-800 font-urdu urdu-font text-base font-bold">(آمدنی و اخراجات کا رجسٹر)</span>
              </h2>
              <p className="text-xs text-gray-500">
                Official double-entry cashbook with S.No, Date, Particular, Category, Subcategory, Receipt No, Income, Expense and Running Balance
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenNewVoucher('Income')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-200" />
            <span>+ Add Income (آمدنی)</span>
          </button>

          <button
            onClick={() => handleOpenNewVoucher('Expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-200" />
            <span>+ Add Expense (خرچ)</span>
          </button>

          <button
            onClick={() => setShowCatModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold border border-gray-300 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-amber-700" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 transition-colors"
            title="Download formatted Excel table"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold shadow-xs transition-colors"
            title="Print Neatly Arranged Excel Sheet"
          >
            <Printer className="w-4 h-4 text-gray-300" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Clean Solid Material 3, No CSS Gradients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="p-5 bg-white rounded-3xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Income (کل آمدنی)</span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-2 font-mono">₹{totalIncome.toLocaleString()}</p>
          <span className="text-[11px] text-gray-500 block mt-1">
            {transactions.filter(t => t.type === 'Income').length} credit vouchers recorded
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Expenses (کل اخراجات)</span>
            <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2 font-mono">₹{totalExpense.toLocaleString()}</p>
          <span className="text-[11px] text-gray-500 block mt-1">
            {transactions.filter(t => t.type === 'Expense').length} debit vouchers cleared
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Closing Cash Balance (بقایا)</span>
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-950 mt-2 font-mono">₹{netBalance.toLocaleString()}</p>
          <span className={`text-[11px] font-bold block mt-1 ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {netBalance >= 0 ? '✓ Treasury Surplus (خوشگوار بیلنس)' : '⚠ Deficit in Cashbook'}
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Total Categories (شعبہ جات)</span>
            <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2 font-mono">{categories.length}</p>
          <span className="text-[11px] text-gray-500 block mt-1">
            {categories.reduce((acc, c) => acc + c.subcategories.length, 0)} subcategories mapped
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Particular, Receipt No, Category..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 bg-gray-50/50"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-semibold">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:outline-none focus:border-emerald-600"
            >
              <option value="All">All Categories (تمام مدات)</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
            <button
              onClick={() => setFilterType('All')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${filterType === 'All' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-600'}`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('Income')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${filterType === 'Income' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-800'}`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('Expense')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${filterType === 'Expense' ? 'bg-rose-700 text-white shadow-xs' : 'text-rose-800'}`}
            >
              Expense
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          Showing <strong>{filteredTransactions.length}</strong> of {transactions.length} vouchers
        </div>
      </div>

      {/* Official Print Header - Only visible when printing */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-xl font-black uppercase tracking-wider">{activeMadrasa?.name || 'JAMIA DARUL HUDA ISLAMIC ACADEMY'}</h1>
        <p className="font-urdu text-lg urdu-font font-bold mt-1">{activeMadrasa?.nameUrdu || 'جامعہ دار الہدیٰ اسلامک اکیڈمی'}</p>
        <p className="text-xs text-gray-700 mt-1">{activeMadrasa?.address || 'Hyderabad, Telangana'}</p>
        <h2 className="text-sm font-bold uppercase tracking-widest mt-2 border-t border-black pt-1">
          Income & Expenditures Cashbook Ledger (آمدنی و اخراجات کا سرکاری رجسٹر)
        </h2>
        <div className="flex justify-between text-[11px] font-mono mt-1 text-gray-600">
          <span>Date Printed: {new Date().toLocaleDateString('en-GB')}</span>
          <span>Financial Period: 2026-2027</span>
          <span>Total Transactions: {filteredTransactions.length}</span>
        </div>
      </div>

      {/* NEAT EXCEL-STYLE TABLE */}
      <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            {/* Excel-style Header with distinct borders */}
            <thead>
              <tr className="bg-[#f2f4f7] text-gray-900 border-b-2 border-gray-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-2.5 border-r border-gray-300 text-center w-12">S.No</th>
                <th className="p-2.5 border-r border-gray-300 text-center w-24">Date</th>
                <th className="p-2.5 border-r border-gray-300">Particular (تفصیل و بابت)</th>
                <th className="p-2.5 border-r border-gray-300 w-36">Category (مد)</th>
                <th className="p-2.5 border-r border-gray-300 w-40">Subcategory (ذیلی مد)</th>
                <th className="p-2.5 border-r border-gray-300 text-center w-28">Receipt No</th>
                <th className="p-2.5 border-r border-gray-300 text-right w-28 text-emerald-800">Income ₹</th>
                <th className="p-2.5 border-r border-gray-300 text-right w-28 text-rose-800">Expense ₹</th>
                <th className="p-2.5 border-r border-gray-300 text-right w-32 text-blue-900">Balance ₹</th>
                <th className="p-2.5 text-center w-20 no-print">Action</th>
              </tr>
            </thead>

            {/* Table Rows with subtle Excel alternating gridlines */}
            <tbody className="divide-y divide-gray-200 font-normal">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    No vouchers match the selected filter. Click <strong>+ Add Income</strong> or <strong>+ Add Expense</strong> to record entries.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const isIncome = tx.type === 'Income';
                  return (
                    <tr 
                      key={tx.id} 
                      className={`hover:bg-amber-50/40 transition-colors border-b border-gray-200 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'
                      }`}
                    >
                      {/* S.No */}
                      <td className="p-2 border-r border-gray-200 text-center font-mono font-bold text-gray-700">
                        {tx.sNo}
                      </td>

                      {/* Date */}
                      <td className="p-2 border-r border-gray-200 text-center font-mono text-gray-600 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Particular */}
                      <td className="p-2 border-r border-gray-200">
                        <div className="font-semibold text-gray-900">{tx.particular}</div>
                        {tx.notes && (
                          <span className="text-[10px] text-gray-500 italic block mt-0.5">{tx.notes}</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-2 border-r border-gray-200">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                          {tx.category}
                        </span>
                      </td>

                      {/* Subcategory */}
                      <td className="p-2 border-r border-gray-200 text-gray-700 text-[11px]">
                        {tx.subcategory}
                      </td>

                      {/* Receipt No */}
                      <td className="p-2 border-r border-gray-200 text-center font-mono text-xs font-bold text-gray-700 whitespace-nowrap">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          {tx.receiptNo}
                        </span>
                      </td>

                      {/* Income */}
                      <td className="p-2 border-r border-gray-200 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {tx.incomeAmount > 0 ? (
                          <span>+₹{tx.incomeAmount.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Expense */}
                      <td className="p-2 border-r border-gray-200 text-right font-mono font-bold text-rose-700 whitespace-nowrap">
                        {tx.expenseAmount > 0 ? (
                          <span>-₹{tx.expenseAmount.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Running Balance */}
                      <td className="p-2 border-r border-gray-200 text-right font-mono font-bold text-blue-950 bg-blue-50/20 whitespace-nowrap">
                        ₹{tx.balance.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-center no-print whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-emerald-700 transition-colors"
                            title="Edit Voucher"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id, tx.particular)}
                            className="p-1 rounded hover:bg-rose-100 text-gray-400 hover:text-rose-700 transition-colors"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Excel-style Totals Summary Footer */}
            <tfoot>
              <tr className="bg-[#e9ecef] border-t-2 border-b-2 border-gray-500 font-bold text-gray-900">
                <td colSpan={6} className="p-3 text-right border-r border-gray-300 uppercase tracking-wider text-xs">
                  Grand Totals / کل میزان جملہ:
                </td>
                <td className="p-3 text-right border-r border-gray-300 font-mono text-emerald-800 text-xs">
                  +₹{totalIncome.toLocaleString()}
                </td>
                <td className="p-3 text-right border-r border-gray-300 font-mono text-rose-800 text-xs">
                  -₹{totalExpense.toLocaleString()}
                </td>
                <td className="p-3 text-right border-r border-gray-300 font-mono text-blue-950 text-sm">
                  ₹{netBalance.toLocaleString()}
                </td>
                <td className="p-3 no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Print Footer with Signatures */}
      <div className="hidden print:flex justify-between items-end pt-12 text-xs">
        <div className="text-center w-48">
          <div className="w-full h-px bg-black mb-2" />
          <p className="font-bold">Accountant / محاسب</p>
          <p className="text-[10px] text-gray-600">Jamia Darul Huda</p>
        </div>
        <div className="text-center w-48">
          <div className="w-full h-px bg-black mb-2" />
          <p className="font-bold">Nazim-e-Maaliyat (ناظم مالیات)</p>
          <p className="text-[10px] text-gray-600">Treasury Incharge</p>
        </div>
        <div className="text-center w-48">
          <div className="w-full h-px bg-black mb-2" />
          <p className="font-bold">Principal / مہتمم صاحب</p>
          <p className="text-[10px] text-gray-600">{activeMadrasa?.principalName}</p>
        </div>
      </div>

      {/* ADD / EDIT VOUCHER MODAL */}
      <Modal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title={editingTxId ? 'Edit Financial Voucher (واؤچر کی تدوین)' : `Record ${txType} Voucher (${txType === 'Income' ? 'آمدنی' : 'اخراجات'})`}
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
          {/* Type Toggle */}
          <div className="flex rounded-xl p-1 bg-gray-100 border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setTxType('Income');
                const matching = categories.filter(c => c.type === 'Income' || c.type === 'Both');
                if (matching.length > 0) {
                  setTxCategory(matching[0].name);
                  setTxSubcategory(matching[0].subcategories[0] || '');
                }
              }}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                txType === 'Income' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Income / آمدنی</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTxType('Expense');
                const matching = categories.filter(c => c.type === 'Expense' || c.type === 'Both');
                if (matching.length > 0) {
                  setTxCategory(matching[0].name);
                  setTxSubcategory(matching[0].subcategories[0] || '');
                }
              }}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                txType === 'Expense' ? 'bg-rose-700 text-white shadow-xs' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Expense / اخراجات</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Date (تاریخ) *</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                required
                className="w-full p-2 rounded-xl border border-gray-300 font-mono"
              />
            </div>

            {/* Receipt No */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Receipt / Voucher No (رسید نمبر) *</label>
              <input
                type="text"
                value={txReceiptNo}
                onChange={(e) => setTxReceiptNo(e.target.value)}
                required
                placeholder="e.g. RCP-2026-101"
                className="w-full p-2 rounded-xl border border-gray-300 font-mono font-bold"
              />
            </div>
          </div>

          {/* Particular */}
          <div>
            <label className="font-bold text-gray-700 block mb-1">Particular / Description (تفصیل و بابت) *</label>
            <input
              type="text"
              value={txParticular}
              onChange={(e) => setTxParticular(e.target.value)}
              required
              placeholder="e.g. Monthly Fees Collection from Class Hifz / Ration Wholesale"
              className="w-full p-2 rounded-xl border border-gray-300 font-semibold"
            />
          </div>

          {/* Category Dropdown with inline quick-add */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-gray-700">Category (مد / شعبہ) *</label>
              <button
                type="button"
                onClick={() => setQuickAddCatOpen(!quickAddCatOpen)}
                className="text-[11px] text-emerald-800 font-bold hover:underline"
              >
                + Quick Add Category
              </button>
            </div>
            <select
              value={txCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                setTxCategory(newCat);
                const matched = categories.find(c => c.name === newCat);
                if (matched && matched.subcategories.length > 0) {
                  setTxSubcategory(matched.subcategories[0]);
                } else {
                  setTxSubcategory('General');
                }
              }}
              required
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
            >
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.nameUrdu})</option>
              ))}
            </select>

            {/* Inline Quick Add Category Form */}
            {quickAddCatOpen && (
              <div className="mt-2 p-2.5 bg-gray-50 border border-emerald-300 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-emerald-900 block">Add New Category to Database:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Category Name (English)"
                    value={quickCatName}
                    onChange={(e) => setQuickCatName(e.target.value)}
                    className="p-1.5 text-xs rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    placeholder="نام شعبہ (اردو)"
                    value={quickCatUrdu}
                    onChange={(e) => setQuickCatUrdu(e.target.value)}
                    className="p-1.5 text-xs rounded border border-gray-300 font-urdu urdu-font text-right"
                  />
                </div>
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickAddCatOpen(false)}
                    className="px-2.5 py-1 text-[11px] text-gray-600 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickAddCategory}
                    className="px-3 py-1 text-[11px] font-bold bg-emerald-700 text-white rounded hover:bg-emerald-800"
                  >
                    Save Category
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Subcategory Dropdown with inline quick-add */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-gray-700">Subcategory (ذیلی مد) *</label>
              <button
                type="button"
                onClick={() => setQuickAddSubOpen(!quickAddSubOpen)}
                className="text-[11px] text-emerald-800 font-bold hover:underline"
              >
                + Quick Add Subcategory
              </button>
            </div>
            <select
              value={txSubcategory}
              onChange={(e) => setTxSubcategory(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
            >
              {availableSubcategories.map((sub, i) => (
                <option key={i} value={sub}>{sub}</option>
              ))}
              {availableSubcategories.length === 0 && (
                <option value="General">General (عمومی)</option>
              )}
            </select>

            {/* Inline Quick Add Subcategory Form */}
            {quickAddSubOpen && (
              <div className="mt-2 p-2.5 bg-gray-50 border border-emerald-300 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-emerald-900 block">Add Subcategory to "{txCategory}":</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New Subcategory Name (e.g. Cooking Oil / Atta)"
                    value={quickSubName}
                    onChange={(e) => setQuickSubName(e.target.value)}
                    className="flex-1 p-1.5 text-xs rounded border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddSubcategory}
                    className="px-3 py-1 text-[11px] font-bold bg-emerald-700 text-white rounded hover:bg-emerald-800"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAddSubOpen(false)}
                    className="px-2 py-1 text-[11px] text-gray-600"
                  >
                    X
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Amount ₹ (رقم) *</label>
              <input
                type="number"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                required
                min="1"
                placeholder="e.g. 5000"
                className="w-full p-2 rounded-xl border border-gray-300 font-mono text-base font-bold text-gray-900"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Payment Mode (طریقہ ادائیگی) *</label>
              <select
                value={txPaymentMode}
                onChange={(e) => setTxPaymentMode(e.target.value as any)}
                className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium"
              >
                <option value="Cash">Cash (نقدی)</option>
                <option value="Bank Transfer">Bank Transfer (بینک منتقلی)</option>
                <option value="Cheque">Cheque (چیک)</option>
                <option value="UPI / Online">UPI / Online (آن لائن)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-gray-700 block mb-1">Notes / Remarks (اضافی تفصیلات)</label>
            <textarea
              rows={2}
              value={txNotes}
              onChange={(e) => setTxNotes(e.target.value)}
              placeholder="e.g. Cheque number, vendor name, or donor contact info"
              className="w-full p-2 rounded-xl border border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowVoucherModal(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white font-bold shadow-xs ${
                txType === 'Income' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              {editingTxId ? 'Save Changes' : `Save ${txType} Voucher`}
            </button>
          </div>
        </form>
      </Modal>

      {/* MANAGE CATEGORIES & SUBCATEGORIES MODAL */}
      <Modal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        title="Manage Financial Categories & Subcategories (آمدنی و اخراجات کی مدات)"
      >
        <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {/* Add Category Form */}
          <form onSubmit={handleCreateCategory} className="p-4 bg-gray-50 rounded-2xl border border-gray-300 space-y-3">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-emerald-700" />
              <span>Add New Category (نئی مد شامل کریں)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Library & Books Waqf"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">مد کا نام (اردو)</label>
                <input
                  type="text"
                  placeholder="مثلاً وقف کتب خانہ"
                  value={newCatUrdu}
                  onChange={(e) => setNewCatUrdu(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 bg-white font-urdu urdu-font text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Applicable For (قسم)</label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium"
                >
                  <option value="Income">Income Only (صرف آمدنی)</option>
                  <option value="Expense">Expense Only (صرف اخراجات)</option>
                  <option value="Both">Both (آمدنی و اخراجات دونوں)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">First Subcategory (پہلی ذیلی مد)</label>
                <input
                  type="text"
                  placeholder="e.g. Arabic Lexicons"
                  value={newCatInitialSub}
                  onChange={(e) => setNewCatInitialSub(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs"
              >
                + Add Category to Ledger
              </button>
            </div>
          </form>

          {/* List of Existing Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">
              Existing Ledger Categories & Subcategories ({categories.length})
            </h4>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3.5 bg-white rounded-2xl border border-gray-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                      <span className="text-emerald-800 font-urdu urdu-font font-bold text-sm ml-2">({cat.nameUrdu})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      cat.type === 'Income' ? 'bg-emerald-100 text-emerald-900' :
                      cat.type === 'Expense' ? 'bg-rose-100 text-rose-900' :
                      'bg-blue-100 text-blue-900'
                    }`}>
                      {cat.type}
                    </span>
                  </div>

                  {/* Subcategories Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.subcategories.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-[11px]"
                      >
                        {sub}
                      </span>
                    ))}

                    {/* Subcategory Add Input */}
                    {activeSubcatInputId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          autoFocus
                          placeholder="New subcategory..."
                          value={newSubcatText}
                          onChange={(e) => setNewSubcatText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubcategory(cat.id);
                            }
                          }}
                          className="px-2 py-0.5 text-[11px] rounded border border-emerald-400 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubcategory(cat.id)}
                          className="p-1 rounded bg-emerald-700 text-white"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubcatInputId(null);
                            setNewSubcatText('');
                          }}
                          className="p-1 rounded bg-gray-200 text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubcatInputId(cat.id);
                          setNewSubcatText('');
                        }}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold"
                      >
                        + Add Subcategory
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
