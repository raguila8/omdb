Rails.application.routes.draw do
	root 'movies#index'
  get '/movie', to: 'movies#show'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
