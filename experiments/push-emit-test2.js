const some_var = /*%% emit.push(); %%*/This text right here will be formatted using "JSON" even if we use \special\ 'characters' in it!/*%% emit.json(emit.pop()); %%*/;
