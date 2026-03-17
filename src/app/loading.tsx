export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Анимированный логотип */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-blue-300 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 border-4 border-blue-200 border-t-transparent rounded-full animate-spin animation-delay-300"></div>
        </div>

        {/* Текст */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Загрузка...</h2>
        <p className="text-gray-600">Пожалуйста, подождите</p>

        {/* Прогресс бар */}
        <div className="mt-6 w-64 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-blue-600 animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
